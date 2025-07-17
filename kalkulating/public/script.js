const firebaseConfig = {
  apiKey: "AIzaSyDXVpOaKteNhTb31idp6ZPzhW6vea8_7u0",
  authDomain: "official-jobdesk.firebaseapp.com",
  projectId: "official-jobdesk",
  storageBucket: "official-jobdesk.appspot.com",
  messagingSenderId: "331986467875",
  appId: "1:331986467875:web:4ed292e7ad4dd8c0f44596",
  measurementId: "G-EJQXV6KQLL"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const barangList = [];
const bodyBarang = document.getElementById("bodyBarang");
const filter = document.getElementById("filterKategori");
const searchInput = document.getElementById("pencarianBarang");
const tabelPilihanBody = document.querySelector('#tabelPilihan tbody');
const subtotalCell = document.getElementById('subtotal');
const popup = document.getElementById("popup");
const popupImage = document.getElementById("popupImage");

let currentImages = [];
let currentImageIndex = 0;
let startX = 0;

searchInput.addEventListener("input", () => renderBarang(filter.value));
filter.addEventListener("change", () => renderBarang(filter.value));

db.collection("produk").get().then(snapshot => {
  const kategoriSet = new Set();

  snapshot.forEach(doc => {
    const data = doc.data();
    const harga = data.gudangList?.[0]?.hargaPerGolongan?.[0]?.harga || 0;
    const kategori = data.kategori?.trim() || "Tanpa Kategori";

    barangList.push({
      id: doc.id,
      nama: data.namabarang || "Tanpa Nama",
      kategori,
      harga,
      icon: "fas fa-box",
      imageUrl: (data.imageUrl || []).map(url => url.replace(/^"|"$/g, ''))
    });

    kategoriSet.add(kategori);
  });

  filter.innerHTML = `<option value="semua">Tampilkan Semua</option>`;
  [...kategoriSet].sort().forEach(k => {
    const opt = document.createElement("option");
    opt.value = k;
    opt.textContent = k;
    filter.appendChild(opt);
  });

  renderBarang("semua");
});

function renderBarang(kategori) {
  bodyBarang.innerHTML = "";
  const keyword = searchInput.value.toLowerCase();

  const filtered = barangList.filter(b =>
    (kategori === "semua" || b.kategori === kategori) &&
    (b.nama || "").toLowerCase().includes(keyword)
  );

  filtered.forEach(item => {
    const row = document.createElement("tr");
    row.setAttribute("data-id", item.id);
    row.innerHTML = `
      <td><i class="${item.icon}" onclick="openPopup('${item.id}')" style="cursor:pointer;"></i></td>
      <td>${item.nama}</td>
      <td><input type="number" min="1" step="1" class="input-jumlah" data-id="${item.id}" data-nama="${item.nama}"></td>
      <td>Rp ${item.harga.toLocaleString('id-ID')}</td>
    `;
    bodyBarang.appendChild(row);
  });

  applyListeners();
}

function openPopup(id) {
  const item = barangList.find(b => b.id == id);
  if (!item) return;

  currentImages = item.imageUrl || [];
  currentImageIndex = 0;
  showCurrentImage();
  popup.style.display = "flex";
}

function showCurrentImage() {
  const url = currentImages.length > 0 ? currentImages[currentImageIndex] : "";
  popupImage.src = url || "https://via.placeholder.com/400x300?text=No+Image";
}

function closePopup(e) {
  if (e.target.id === "popup") popup.style.display = "none";
}

popupImage.addEventListener("touchstart", e => startX = e.touches[0].clientX);
popupImage.addEventListener("touchend", e => {
  const endX = e.changedTouches[0].clientX;
  const delta = endX - startX;
  if (delta > 50) currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
  else if (delta < -50) currentImageIndex = (currentImageIndex + 1) % currentImages.length;
  showCurrentImage();
});

function applyListeners() {
  document.querySelectorAll('.input-jumlah').forEach(input => {
    input.addEventListener('input', handleUpdate);
  });
}

function handleUpdate() {
  const id = this.dataset.id;
  const nama = this.dataset.nama;
  const jumlah = parseInt(this.value);
  const barang = barangList.find(b => b.id == id);
  const harga = barang.harga;

  if (!jumlah || jumlah < 1) {
    const row = tabelPilihanBody.querySelector(`tr[data-id="${id}"]`);
    if (row) row.remove();
    updateSubtotal();
    return;
  }

  const total = harga * jumlah;
  let row = tabelPilihanBody.querySelector(`tr[data-id="${id}"]`);

  if (!row) {
    row = document.createElement("tr");
    row.setAttribute("data-id", id);
    row.innerHTML = `
      <td><input type="checkbox" class="cek-pilih"></td>
      <td><i class="${barang.icon}" onclick="openPopup('${id}')" style="cursor:pointer;"></i></td>
      <td>${nama}</td>
      <td class="jumlah-cell">${jumlah}</td>
      <td class="harga-cell">${harga}</td>
      <td class="total-cell">${total}</td>
    `;
    tabelPilihanBody.appendChild(row);
  } else {
    row.querySelector('.jumlah-cell').textContent = jumlah;
    row.querySelector('.total-cell').textContent = total;
  }

  updateSubtotal();
}

function updateSubtotal() {
  let total = 0;
  document.querySelectorAll('.total-cell').forEach(cell => {
    total += parseInt(cell.textContent) || 0;
  });
  subtotalCell.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

function hapusTerpilih() {
  document.querySelectorAll('.cek-pilih:checked').forEach(cb => {
    cb.closest('tr').remove();
  });
  updateSubtotal();
}

function kirimPesanan() {
  const rows = document.querySelectorAll('#tabelPilihan tbody tr');
  const dataPesanan = [];

  rows.forEach(row => {
    const namabarang = row.children[2].textContent;
    const jumlah = parseInt(row.children[3].textContent);
    const harga = parseInt(row.children[4].textContent);
    const total = parseInt(row.children[5].textContent);
    dataPesanan.push({ namabarang, jumlah, harga, total });
  });

  if (dataPesanan.length === 0) {
    alert("❗ Tidak ada barang yang dipilih!");
    return;
  }

  const dataBaru = {
    waktu: new Date().toLocaleString('id-ID'),
    nama: document.getElementById("namaPemesan").value,
    tanggal: document.getElementById("tanggalPesan").value,
    selesai: document.getElementById("waktuSelesai").value,
    alamat: document.getElementById("alamatPemesan").value,
    lokasi: document.getElementById("lokasiTitik").value,
    items: dataPesanan
  };

  db.collection("websitebarang").add(dataBaru)
    .then(docRef => {
      const riwayat = JSON.parse(localStorage.getItem('produk') || '[]');
      riwayat.push(dataBaru);
      localStorage.setItem('produk', JSON.stringify(riwayat));
      alert("✅ Pesanan berhasil dikirim!");
      window.location.href = "pesanan.html";
    })
    .catch(err => {
      console.error("❌ Gagal kirim:", err);
      alert("❌ Gagal menyimpan: " + err.message);
    });
}
