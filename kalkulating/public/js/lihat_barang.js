let koordinat = { lat: -7.424278, lng: 109.239639 };
const gudangLatLng = { lat: -7.426870, lng: 109.247394 };
let map = L.map('map').setView([koordinat.lat, koordinat.lng], 15);
let marker = null;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

map.on('click', async function (e) {
  koordinat = e.latlng;
  if (marker) map.removeLayer(marker);
  marker = L.marker(e.latlng).addTo(map);

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${koordinat.lat}&lon=${koordinat.lng}&format=json`);
    const data = await response.json();
    const address = data.address;

    const alamatLengkap = [
      address.road || address.pedestrian || '',
      address.neighbourhood || '',
      address.city_district || address.county || '',
      address.city || address.town || address.village || '',
      address.state || ''
    ].filter(Boolean).join(', ');

    document.getElementById('alamat').value = alamatLengkap;

    const jarak = hitungJarak(
      koordinat.lat,
      koordinat.lng,
      gudangLatLng.lat,
      gudangLatLng.lng
    );
    document.getElementById('jarak').value = `${jarak.toFixed(2)} km`;
  } catch (err) {
    console.error('Gagal ambil alamat:', err);
    document.getElementById('alamat').value = 'Gagal memuat alamat';
    document.getElementById('jarak').value = '';
  }
});

function hitungJarak(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function hapusChecklist() {
  const rows = Array.from(document.querySelectorAll('#tbody-barang tr'));
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
  const alamat = document.getElementById('alamat').value;

  if (!nama || !tanggalPesan || !tanggalSelesai || !alamat) {
    alert('Silakan lengkapi semua data terlebih dahulu.');
    return;
  }

  const data = {
    nama,
    tanggalPesan,
    tanggalSelesai,
    alamat,
    koordinat,
    barang: []
  };

  const rows = document.querySelectorAll('#tbody-barang tr');
  rows.forEach(row => {
    const jumlah = parseInt(row.querySelector('input[type="number"]').value);
    const namaProduk = row.cells[2].textContent;
    const harga = parseInt(row.cells[4].textContent);
    const total = jumlah * harga;
    data.barang.push({ namaProduk, jumlah, harga, total });
  });

  localStorage.setItem('dataPemesanan', JSON.stringify(data));
  window.location.href = 'pesanan.html';
}

function updateTotal(input) {
  const row = input.closest('tr');
  const jumlah = parseInt(input.value);
  const harga = parseInt(row.cells[4].textContent);
  row.querySelector('.total-harga').textContent = jumlah * harga;
}

// Load barang dari localStorage
const barangTerpilih = JSON.parse(localStorage.getItem('barangTerpilih') || '[]');
const tbody = document.getElementById('tbody-barang');
barangTerpilih.forEach(item => {
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

// Checkbox select all
document.getElementById('selectAll').addEventListener('change', function () {
  const checkboxes = document.querySelectorAll('#tbody-barang input[type="checkbox"]');
  checkboxes.forEach(cb => cb.checked = this.checked);
});

// Auto set tanggal hari ini sebagai minimal
window.onload = () => {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('tanggalPesan').min = today;
  document.getElementById('tanggalSelesai').min = today;
};

// Perbaiki focus input date
document.querySelectorAll('input[type="date"]').forEach(input => {
  input.addEventListener('focus', function () {
    if (this.showPicker) this.showPicker();
  });
});
