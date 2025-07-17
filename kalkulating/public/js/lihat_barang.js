const firebaseConfig = {
  apiKey: "AIzaSyDXVpOaKteNhTb31idp6ZPzhW6vea8_7u0",
  authDomain: "official-jobdesk.firebaseapp.com",
  projectId: "official-jobdesk",
  storageBucket: "official-jobdesk.appspot.com",
  messagingSenderId: "331986467875",
  appId: "1:331986467875:web:4ed292e7ad4dd8c0f44596",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


let koordinat = { lat: -7.424278, lng: 109.239639 };
const map = L.map('map').setView([koordinat.lat, koordinat.lng], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

let marker = L.marker([koordinat.lat, koordinat.lng]).addTo(map);

map.on('click', function (e) {
  koordinat = e.latlng;
  if (marker) map.removeLayer(marker);
  marker = L.marker(e.latlng).addTo(map);
});

function hapusChecklist() {
  const tbody = document.getElementById('tbody-barang');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  rows.forEach(row => {
    if (row.querySelector('input[type="checkbox"]').checked) {
      row.remove();
    }
  });
}
function kirimPemesanan() {
  const nama = document.getElementById('nama').value.trim();
  const tanggalPesan = document.getElementById('tanggalPesan').value;
  const tanggalSelesai = document.getElementById('tanggalSelesai').value;
  const alamat = document.getElementById('alamat').value.trim();

  if (!nama || !tanggalPesan || !tanggalSelesai || !alamat) {
    alert("Mohon lengkapi semua data pemesanan.");
    return;
  }

  const data = {
    nama,
    tanggalPesan,
    tanggalSelesai,
    alamat,
    koordinat,
    barang: [],
    waktuSubmit: new Date()
  };

  const rows = document.querySelectorAll('#tbody-barang tr');
  rows.forEach(row => {
    const jumlah = row.querySelector('input[type="number"]').value;
    const namaProduk = row.cells[2].textContent;
    const harga = parseInt(row.cells[4].textContent);
    const total = parseInt(jumlah) * harga;
    data.barang.push({ namaProduk, jumlah: parseInt(jumlah), harga, total });
  });

  // Simpan ke Firestore
  db.collection("pemesanan").add(data)
    .then(() => {
      alert("Pemesanan berhasil disimpan ke database!");
      // Bersihkan localStorage jika perlu
      localStorage.removeItem("barangTerpilih");
      window.location.href = 'pesanan.html';
    })
    .catch((error) => {
      console.error("Gagal menyimpan data:", error);
      alert("Terjadi kesalahan saat menyimpan data. Silakan coba lagi.");
    });
}


// Load dari localStorage
const dummyBarang = JSON.parse(localStorage.getItem('barangTerpilih') || '[]');
const tbody = document.getElementById('tbody-barang');
dummyBarang.forEach(item => {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="checkbox"></td>
    <td><img src="${item.gambar}" alt="${item.nama}" /></td>
    <td>${item.nama}</td>
    <td><input type="number" value="1" min="1" onchange="updateTotal(this)" /></td>
    <td>${item.harga}</td>
    <td class="total-harga">${item.harga}</td>
  `;
  tbody.appendChild(tr);
});

function updateTotal(input) {
  const row = input.closest('tr');
  const jumlah = parseInt(input.value);
  const harga = parseInt(row.cells[4].textContent);
  row.querySelector('.total-harga').textContent = jumlah * harga;
}

document.getElementById('selectAll').addEventListener('change', function () {
  const checkboxes = document.querySelectorAll('#tbody-barang input[type="checkbox"]');
  checkboxes.forEach(cb => cb.checked = this.checked);
});

window.onload = () => {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('tanggalPesan').setAttribute('min', today);
  document.getElementById('tanggalSelesai').setAttribute('min', today);
};
