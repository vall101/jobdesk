<?php
$koneksi = new mysqli("localhost", "root", "", "perpustakaan");

// Simpan data jika form disubmit
if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $kd = $_POST['kd_anggota'];
  $nama = $_POST['nama'];
  $member = $_POST['member'];
  $minat = $_POST['minat'];

  $stmt = $koneksi->prepare("INSERT INTO anggota (kd_anggota, nama, member, minat_baca) VALUES (?, ?, ?, ?)");
  $stmt->bind_param("ssss", $kd, $nama, $member, $minat);
  $stmt->execute();

  header("Location: index.php");
  exit;
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Tambah Anggota</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f2f2f2;
      padding: 30px;
    }
    form {
      background: white;
      padding: 20px;
      width: 400px;
      border-radius: 8px;
      box-shadow: 0 0 10px #ccc;
    }
    label {
      display: block;
      margin-top: 10px;
    }
    input, select {
      width: 100%;
      padding: 8px;
      margin-top: 4px;
      box-sizing: border-box;
    }
    button {
      margin-top: 15px;
      padding: 10px 20px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    a {
      display: inline-block;
      margin-top: 10px;
      color: #333;
      text-decoration: none;
    }
  </style>
</head>
<body>

<h2>Form Tambah Anggota</h2>

<form method="post">
  <label for="kd_anggota">Kode Anggota:</label>
  <input type="text" name="kd_anggota" required>

  <label for="nama">Nama Anggota:</label>
  <input type="text" name="nama" required>

  <label for="member">Member:</label>
  <select name="member" required>
    <option value="Gold">Gold</option>
    <option value="Silver">Silver</option>
    <option value="Bronze">Bronze</option>
  </select>

  <label for="minat">Minat Baca:</label>
  <input type="text" name="minat" required>

  <button type="submit">Simpan</button>
</form>

<a href="index.php">← Kembali ke Daftar Anggota</a>

</body>
</html>
