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
const tabelPilihanBody = document.querySelector('#tabelPilihan tbody');
const subtotalCell = document.getElementById('subtotal');
const popupContent = document.getElementById('popupContent');
const searchInput = document.getElementById("pencarianBarang");
const popupImage = document.getElementById('popupImage');

let currentImageIndex = 0;
let currentImages = [];

searchInput.addEventListener("input", () => renderBarang(filter.value));
filter.addEventListener("change", () => renderBarang(filter.value));

function renderBarang(kategori) {
  bodyBarang.innerHTML = "";
  const keyword = searchInput.value.toLowerCase();

  const filtered = barangList.filter(b => {
    const cocokKategori = kategori === "semua" || b.kategori === kategori;
    const cocokNama = (b.nama || "").toLowerCase().includes(keyword);
    return cocokKategori && cocokNama;
  });

  filtered.forEach(item => {
    const row = document.createElement("tr");
    row.setAttribute("data-id", item.id);
    row.innerHTML = `
      <td><i class="${item.icon} icon" onclick="openPopup('${item.id}')"></i></td>
      <td>${item.nama}</td>
      <td><input type="number" min="1" step="1" class="input-jumlah" data-id="${item.id}" data-nama="${item.nama}"></td>
      <td>Rp ${item.harga.toLocaleString('id-ID')}</td>
    `;
    bodyBarang.appendChild(row);
  });

  applyListeners();
}

function openPopup(id) {
  const popup = document.getElementById("popup");
  popup.style.display = "flex";

  const item = barangList.find(b => b.id == id);
  if (!item) return console.error("Item tidak ditemukan:", id);

  currentImages = item.imageUrl || [];
  currentImageIndex = 0;
  showCurrentImage();
}

function showCurrentImage() {
  popupImage.src = currentImages.length > 0
    ? currentImages[currentImageIndex]
    : "https://firebasestorage.googleapis.com/v0/b/official-jobdesk.firebasestorage.app/o/images%2F6fd348b3-6f9f-44c0-bef9-170dbf9f7d12?alt=media&token=8868cd3a-a3fa-462c-89b5-7efbf4fd306d";
}

function closePopup(e) {
  if (e.target.id === "popup") {
    document.getElementById("popup").style.display = "none";
  }
}

let startX = 0;
popupImage.addEventListener('touchstart', e => startX = e.touches[0].clientX);
popupImage.addEventListener('touchend', e => {
  const endX = e.changedTouches[0].clientX;
  const diffX = endX - startX;
  if (diffX > 50) currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
  else if (diffX < -50) currentImageIndex = (currentImageIndex + 1) % currentImages.length;
  showCurrentImage();
});

let isDragging = false, offset = { x: 0, y: 0 };
function startDrag(e) {
  isDragging = true;
  offset.x = e.clientX - popupContent.offsetLeft;
  offset.y = e.clientY - popupContent.offsetTop;
  window.addEventListener('mousemove', dragPopup);
  window.addEventListener('mouseup', stopDrag);
}
function dragPopup(e) {
  if (isDragging) {
    popupContent.style.left = (e.clientX - offset.x) + 'px';
    popupContent.style.top = (e.clientY - offset.y) + 'px';
  }
}
function stopDrag() {
  isDragging = false;
  window.removeEventListener('mousemove', dragPopup);
  window.removeEventListener('mouseup', stopDrag);
}

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
    row = document.createElement('tr');
    row.setAttribute('data-id', id);
    row.innerHTML = `
      <td><input type="checkbox" class="cek-pilih"></td>
      <td><i class="${barang.icon} icon" onclick="openPopup('${id}')"></i></td>
      <td>${nama}</td>
      <td class="jumlah-cell">${jumlah}</td>
      <td class="harga-cell">${harga}</td>
      <td class="total-cell">${total}</td>
    `;
    tabelPilihanBody.appendChild(row);
  } else {
    row.querySelector('.jumlah-cell').textContent = jumlah;
    row.querySelector('.harga-cell').textContent = harga;
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
    items: dataPesanan
  };

  db.collection("websitebarang").add(dataBaru)
    .then(docRef => {
      console.log("✅ Pesanan disimpan di Firestore:", docRef.id);
      const riwayatLama = JSON.parse(localStorage.getItem('produk') || '[]');
      riwayatLama.push(dataBaru);
      localStorage.setItem('produk', JSON.stringify(riwayatLama));
      alert("✅ Pesanan berhasil dikirim!");
      window.location.href = "pesanan.html";
    })
    .catch(err => {
      console.error("❌ Gagal kirim ke Firestore:", err);
      alert("❌ Gagal menyimpan: " + err.message);
    });
}

db.collection("produk").get().then(snapshot => {
  snapshot.forEach(doc => {
    const data = doc.data();
    let hargaDefault = 0;

    try {
      hargaDefault = data.gudangList?.[0]?.hargaPerGolongan?.[0]?.harga || 0;
    } catch (e) {
      hargaDefault = 0;
    }

    barangList.push({
      id: doc.id,
      nama: data.namabarang || "Tanpa Nama",
      kategori: data.kategori || "Umum",
      harga: hargaDefault,
      icon: "fas fa-box",
      imageUrl: data.imageUrl || []
    });
  });

  renderBarang("semua");
}).catch(err => {
  console.error("Gagal mengambil data barang:", err);
});
