<?php

namespace Tests\Feature;

use App\Models\Kecamatan;
use App\Models\LandAsset;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    private function user(string $role): User
    {
        return User::factory()->create(['role' => $role, 'is_active' => true]);
    }

    private function assetPayload(array $overrides = []): array
    {
        return array_merge([
            'nama_jenis_barang' => 'Tanah Uji', 'kode_barang' => '01.01.01', 'register' => 'REG-1',
            'luas' => 1250, 'tahun_pengadaan' => 2025, 'lokasi' => 'Saumlaki', 'letak_alamat' => 'Alamat Uji',
            'kecamatan' => 'Tanimbar Selatan', 'status_tanah' => 'Hak Pakai', 'jenis_dokumen_kepemilikan' => 'Sertipikat',
            'nama_pemilik' => 'Pemerintah Kabupaten Kepulauan Tanimbar', 'tanggal_dokumen' => '2025-01-01',
            'no_dokumen_kepemilikan' => 'DOC-1', 'asal_usul' => 'Pembelian', 'harga' => 1000000,
            'keterangan' => null, 'pematokan' => true, 'progres_bpn' => 'Sertipikat Selesai',
            'permasalahan' => 'Tidak ada', 'rincian_permasalahan' => null,
            'link_google_maps' => 'https://www.google.com/maps/search/?api=1&query=Saumlaki',
        ], $overrides);
    }

    public function test_database_schema_matches_normalized_asset_design(): void
    {
        $this->assertTrue(Schema::hasTable('role'));
        $this->assertTrue(Schema::hasTable('kecamatan'));
        $this->assertTrue(Schema::hasTable('status_tanah'));
        $this->assertTrue(Schema::hasTable('progres_bpn'));
        $this->assertTrue(Schema::hasTable('jenis_dokumen'));
        $this->assertTrue(Schema::hasTable('dokumen_aset'));
        $this->assertTrue(Schema::hasColumns('users', ['username', 'role_id', 'status_aktif']));
        $this->assertTrue(Schema::hasColumns('assets', ['nomor_register', 'kecamatan_id', 'status_tanah_id', 'progres_bpn_id', 'pematokan', 'ada_permasalahan']));
        $this->assertTrue(Schema::hasColumns('dokumen_aset', ['jenis_dokumen_id', 'nomor_dokumen', 'tanggal_dokumen', 'nama_file', 'lokasi_file', 'diunggah_oleh']));
        $this->assertFalse(Schema::hasTable('asset_documents'));
    }

    public function test_viewer_can_read_assets_but_cannot_create(): void
    {
        $viewer = $this->user('viewer');
        LandAsset::factory()->create();
        Sanctum::actingAs($viewer);
        $this->getJson('/api/assets')->assertOk();
        $this->postJson('/api/assets', $this->assetPayload())->assertForbidden();
    }

    public function test_user_can_login_with_username_and_password(): void
    {
        $user = $this->user('admin');

        $this->postJson('/api/login', [
            'username' => $user->username,
            'password' => 'password',
        ])
            ->assertOk()
            ->assertJsonPath('data.user.username', $user->username)
            ->assertJsonPath('data.user.role', 'admin')
            ->assertJsonStructure(['data' => ['token']]);

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertUnprocessable()->assertJsonValidationErrors('username');
    }

    public function test_authenticated_users_can_list_seeded_kecamatan(): void
    {
        Sanctum::actingAs($this->user('operator'));

        $this->getJson('/api/kecamatan')
            ->assertOk()
            ->assertJsonFragment(['nama' => 'Tanimbar Selatan'])
            ->assertJsonFragment(['nama' => 'Molu Maru']);
    }

    public function test_admin_can_manage_kecamatan_and_cannot_delete_used_kecamatan(): void
    {
        $admin = $this->user('admin');
        Sanctum::actingAs($admin);

        $created = $this->postJson('/api/kecamatan', [
            'nama' => 'Kecamatan Uji',
            'deskripsi' => 'Deskripsi awal',
        ])
            ->assertCreated()
            ->json('data');

        $this->putJson('/api/kecamatan/'.$created['id'], [
            'nama' => 'Kecamatan Uji Baru',
            'deskripsi' => 'Deskripsi diperbarui',
        ])
            ->assertOk()
            ->assertJsonPath('data.nama', 'Kecamatan Uji Baru');

        LandAsset::factory()->create(['kecamatan' => 'Kecamatan Uji Baru']);

        $this->deleteJson('/api/kecamatan/'.$created['id'])
            ->assertUnprocessable();

        $unused = Kecamatan::create(['nama' => 'Kecamatan Kosong']);

        $this->deleteJson('/api/kecamatan/'.$unused->id)
            ->assertNoContent();
    }

    public function test_non_admin_cannot_modify_kecamatan(): void
    {
        Sanctum::actingAs($this->user('operator'));

        $this->postJson('/api/kecamatan', ['nama' => 'Tidak Diizinkan'])
            ->assertForbidden();
    }

    public function test_operator_can_create_and_update_but_not_delete_assets(): void
    {
        $operator = $this->user('operator');
        Sanctum::actingAs($operator);
        $created = $this->postJson('/api/assets', $this->assetPayload())->assertCreated()->json('data');
        $this->putJson('/api/assets/'.$created['id'], ['keterangan' => 'Diperbarui'])->assertOk();
        $this->deleteJson('/api/assets/'.$created['id'])->assertForbidden();
    }

    public function test_asset_list_uses_backend_pagination_and_returns_filtered_metadata(): void
    {
        $viewer = $this->user('viewer');
        $district = Kecamatan::create(['nama' => 'Pagination District']);
        LandAsset::factory()->count(12)->create([
            'kecamatan' => $district->nama,
            'status_tanah' => 'Pagination Status',
        ]);
        Sanctum::actingAs($viewer);

        $this->getJson('/api/assets?page=2&per_page=5&kecamatan=Pagination%20District')
            ->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('meta.current_page', 2)
            ->assertJsonPath('meta.per_page', 5)
            ->assertJsonPath('meta.total', 12)
            ->assertJsonPath('meta.last_page', 3)
            ->assertJsonPath('meta.completeness_counts.Lengkap', 12)
            ->assertJsonFragment(['status_tanah' => 'Pagination Status']);
    }

    public function test_admin_can_manage_users(): void
    {
        $admin = $this->user('admin');
        Sanctum::actingAs($admin);
        $created = $this->postJson('/api/users', ['name' => 'Operator Baru', 'email' => 'operator-baru@example.test', 'password' => 'Temporary12Pass', 'role' => 'operator'])->assertCreated()->json('data');
        $this->putJson('/api/users/'.$created['id'], ['is_active' => false])->assertOk()->assertJsonPath('data.is_active', false);
    }

    public function test_user_list_uses_backend_pagination_and_filters(): void
    {
        Sanctum::actingAs($this->user('admin'));
        User::factory()->count(12)->create(['role' => 'viewer']);

        $this->getJson('/api/users?page=2&per_page=5&role=viewer&is_active=true')
            ->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('meta.current_page', 2)
            ->assertJsonPath('meta.per_page', 5)
            ->assertJsonPath('meta.total', 12)
            ->assertJsonPath('meta.last_page', 3)
            ->assertJsonPath('meta.role_counts.viewer', 12)
            ->assertJsonCount(5, 'meta.latest_users');
    }

    public function test_viewer_can_open_google_maps_link_but_backend_stores_no_coordinates(): void
    {
        $viewer = $this->user('viewer');
        $asset = LandAsset::factory()->create(['link_google_maps' => 'https://www.google.com/maps/search/?api=1&query=Saumlaki']);
        Sanctum::actingAs($viewer);
        $response = $this->getJson('/api/assets/'.$asset->id)->assertOk();
        $response->assertJsonPath('data.link_google_maps', $asset->link_google_maps);
        $response->assertJsonMissingPath('data.latitude');
        $response->assertJsonMissingPath('data.longitude');
    }

    public function test_private_document_download_requires_authorized_session(): void
    {
        Storage::fake('local');
        $admin = $this->user('admin');
        $asset = LandAsset::factory()->create();
        Storage::disk('local')->put('asset-documents/test.pdf', 'pdf');
        $document = $asset->documents()->create([
            'document_type' => 'Sertipikat', 'document_number' => 'DOC-1', 'document_date' => '2025-01-01',
            'file_name' => 'test.pdf', 'file_path' => 'asset-documents/test.pdf', 'mime_type' => 'application/pdf', 'file_size' => 3, 'uploaded_by' => $admin->id,
        ]);
        $this->getJson('/api/documents/'.$document->id.'/download')->assertUnauthorized();
        Sanctum::actingAs($admin);
        $this->get('/api/documents/'.$document->id.'/download')->assertOk();
    }
}
