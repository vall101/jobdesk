<?php
// Koneksi ke database
$koneksi = new mysqli("localhost", "root", "", "perpustakaan");

// Hapus data terpilih (checkbox)
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['hapus_terpilih'])) {
    if (!empty($_POST['selected_ids'])) {
        $ids = implode(',', array_map('intval', $_POST['selected_ids']));
        $koneksi->query("DELETE FROM anggota WHERE id IN ($ids)");
        header("Location: index.php");
        exit;
    }
}

// Hapus satu data lewat URL
if (isset($_GET['hapus'])) {
    $id = intval($_GET['hapus']);
    $koneksi->query("DELETE FROM anggota WHERE id = $id");
    header("Location: index.php");
    exit;
}

// Update data jika form edit disubmit
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['update_id'])) {
    $id     = intval($_POST['update_id']);
    $kd     = $_POST['kd_anggota'];
    $nama   = $_POST['nama'];
    $member = $_POST['member'];
    $minat  = $_POST['minat'];

    $stmt = $koneksi->prepare("UPDATE anggota SET kd_anggota=?, nama=?, member=?, minat_baca=? WHERE id=?");
    $stmt->bind_param("ssssi", $kd, $nama, $member, $minat, $id);
    $stmt->execute();
    header("Location: index.php");
    exit;
}

// Ambil data edit jika ?edit=id
$dataEdit = null;
if (isset($_GET['edit'])) {
    $id = intval($_GET['edit']);
    $result = $koneksi->query("SELECT * FROM anggota WHERE id = $id");
    $dataEdit = $result->fetch_assoc();
}

// Ambil semua data anggota
$data = $koneksi->query("SELECT * FROM anggota");
?>

<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Data Anggota</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f2f2f2;
      padding: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: #fff;
    }
    th, td {
      padding: 10px;
      border: 1px solid #ddd;
      text-align: left;
    }
    th {
      background: #4CAF50;
      color: white;
    }
    button {
      padding: 6px 12px;
      margin: 3px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
    }
    .edit-btn {
      background-color: #2196F3;
      color: white;
      text-decoration: none;
      padding: 5px 10px;
      border-radius: 4px;
    }
    .hapus-btn {
      background-color: #f44336;
      color: white;
      text-decoration: none;
      padding: 5px 10px;
      border-radius: 4px;
    }
    .hapus-terpilih {
      background-color: orange;
      color: white;
      margin-bottom: 10px;
    }
    .form-edit {
      background: white;
      padding: 15px;
      width: 400px;
      margin-bottom: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px #ccc;
    }
    .form-edit input, .form-edit select {
      width: 100%;
      padding: 8px;
      margin-top: 5px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>

<h2>Daftar Anggota</h2>

<!-- Form Edit Jika Ada -->
<?php if ($dataEdit): ?>
  <div class="form-edit">
    <h3>Edit Anggota</h3>
    <form method="post">
      <input type="hidden" name="update_id" value="<?= $dataEdit['id'] ?>">
      <label>Kode Anggota:</label>
      <input type="text" name="kd_anggota" value="<?= $dataEdit['kd_anggota'] ?>" required>

      <label>Nama Anggota:</label>
      <input type="text" name="nama" value="<?= $dataEdit['nama'] ?>" required>

      <label>Member:</label>
      <select name="member" required>
        <option value="Gold" <?= $dataEdit['member'] == 'Gold' ? 'selected' : '' ?>>Gold</option>
        <option value="Silver" <?= $dataEdit['member'] == 'Silver' ? 'selected' : '' ?>>Silver</option>
        <option value="Bronze" <?= $dataEdit['member'] == 'Bronze' ? 'selected' : '' ?>>Bronze</option>
      </select>

      <label>Minat Baca:</label>
      <input type="text" name="minat" value="<?= $dataEdit['minat_baca'] ?>" required>

      <button type="submit" class="edit-btn">Simpan Perubahan</button>
      <a href="index.php" style="margin-left:10px; color:#555;">Batal</a>
    </form>
  </div>
<?php endif; ?>

<!-- Form Tabel + Checkbox -->
<form method="post">
  <button type="submit" name="hapus_terpilih" class="hapus-terpilih">Hapus Terpilih</button>
  <table>
    <thead>
      <tr>
        <th><input type="checkbox" onclick="toggleCheckbox(this)"></th>
        <th>KdAnggota</th>
        <th>Nama Anggota</th>
        <th>Member</th>
        <th>Minat Baca</th>
        <th>Aksi</th>
      </tr>
    </thead>
    <tbody>
      <?php while ($row = $data->fetch_assoc()): ?>
      <tr>
        <td><input type="checkbox" name="selected_ids[]" value="<?= $row['id'] ?>"></td>
        <td><?= $row['kd_anggota'] ?></td>
        <td><?= $row['nama'] ?></td>
        <td><?= $row['member'] ?></td>
        <td><?= $row['minat_baca'] ?></td>
        <td>
          <a href="index.php?edit=<?= $row['id'] ?>" class="edit-btn">Edit</a>
          <a href="index.php?hapus=<?= $row['id'] ?>" class="hapus-btn" onclick="return confirm('Yakin ingin hapus?')">Hapus</a>
        </td>
      </tr>
      <?php endwhile; ?>
    </tbody>
  </table>
</form>

<script>
  function toggleCheckbox(source) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][name="selected_ids[]"]');
    checkboxes.forEach(cb => cb.checked = source.checked);
  }
</script>

</body>
</html>
