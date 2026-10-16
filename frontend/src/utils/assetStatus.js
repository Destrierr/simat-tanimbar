export function getAssetCertificateStatus(asset, uploadedDocuments = []) {
  if (/dikuasai pihak lain|tidak valid/i.test(asset?.issue_type || ""))
    return "Tidak Valid";
  if (
    uploadedDocuments.some((doc) =>
      /sertifikat|sertipikat/i.test(doc.document_type || ""),
    )
  )
    return "Bersertifikat";
  if (uploadedDocuments.length) return "Dalam Proses";
  return "Belum Bersertifikat";
}
