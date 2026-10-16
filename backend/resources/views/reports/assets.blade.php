<!doctype html>
<html lang="id">
	<head>
		<meta charset="utf-8">
		<style>
			body { font-family: DejaVu Sans, sans-serif; font-size: 8px; }
			h1 { font-size: 16px; }
			table { width: 100%; border-collapse: collapse; }
			th, td { border: 1px solid #ccc; padding: 4px; }
			th { background: #eee; }
		</style>
	</head>
	<body>
		<h1>Laporan Aset Tanah</h1>
		<p>Pemerintah Kabupaten Kepulauan Tanimbar · Dicetak {{ now()->format('d/m/Y H:i') }}</p>
		<table>
			<thead>
				<tr>
					<th>Register</th>
					<th>Nama/Jenis Barang</th>
					<th>Kode</th>
					<th>Luas</th>
					<th>Tahun</th>
					<th>Lokasi</th>
					<th>Kecamatan</th>
					<th>Status Tanah</th>
					<th>Dokumen Kepemilikan</th>
					<th>Progres BPN</th>
					<th>Google Maps</th>
				</tr>
			</thead>
			<tbody>
				@foreach ($assets as $asset)
					<tr>
						<td>{{ $asset->register }}</td>
						<td>{{ $asset->nama_jenis_barang }}</td>
						<td>{{ $asset->kode_barang }}</td>
						<td>{{ $asset->luas }}</td>
						<td>{{ $asset->tahun_pengadaan }}</td>
						<td>{{ $asset->lokasi }} / {{ $asset->letak_alamat }}</td>
						<td>{{ $asset->kecamatan }}</td>
						<td>{{ $asset->status_tanah }}</td>
						<td>{{ $asset->jenis_dokumen_kepemilikan }} / {{ $asset->no_dokumen_kepemilikan }}</td>
						<td>{{ $asset->progres_bpn }}</td>
						<td>{{ $asset->link_google_maps }}</td>
					</tr>
				@endforeach
			</tbody>
		</table>
	</body>
</html>
