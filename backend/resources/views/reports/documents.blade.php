<!doctype html>
<html lang="id">
	<head>
		<meta charset="utf-8">
		<style>
			body { font-family: DejaVu Sans, sans-serif; font-size: 9px; }
			table { width: 100%; border-collapse: collapse; }
			th, td { border: 1px solid #ccc; padding: 4px; }
			th { background: #eee; }
		</style>
	</head>
	<body>
		<h1>Laporan Dokumen Aset Tanah</h1>
		<table>
			<thead>
				<tr>
					<th>Register</th>
					<th>Jenis Dokumen</th>
					<th>Nomor</th>
					<th>Tanggal</th>
					<th>File</th>
					<th>MIME</th>
				</tr>
			</thead>
			<tbody>
				@foreach ($documents as $document)
					<tr>
						<td>{{ $document->asset?->register }}</td>
						<td>{{ $document->document_type }}</td>
						<td>{{ $document->document_number }}</td>
						<td>{{ $document->document_date?->format('d/m/Y') }}</td>
						<td>{{ $document->file_name }}</td>
						<td>{{ $document->mime_type }}</td>
					</tr>
				@endforeach
			</tbody>
		</table>
	</body>
</html>
