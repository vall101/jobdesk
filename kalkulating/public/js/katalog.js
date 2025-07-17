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

let semuaProduk = [];
let produkDitampilkan = [];
let produkDipilih = [];
let kategoriAktif = 'Semua';

const produkGrid = document.getElementById("produkGrid");
const kategoriList = document.getElementById("kategoriList");
const searchInput = document.getElementById("searchInput");
const jumlahJenisEl = document.getElementById("jumlahJenis");
const subtotalHargaEl = document.getElementById("subtotalHarga");

db.collection("produk").get().then(snapshot => {
  snapshot.forEach(doc => {
    const data = doc.data();
    let hargaKonsumen = 0;
const hargaGolongan = data.gudangList?.[0]?.hargaPerGolongan || [];
const golonganKonsumen = hargaGolongan.find(h => h.golongan === "Konsumen");
if (golonganKonsumen) hargaKonsumen = golonganKonsumen.harga;

semuaProduk.push({
  id: doc.id,
  nama: data.namabarang,
  kategori: data.kategori || "Lainnya",
  harga: hargaKonsumen,
  gambar: data.imageUrl?.[0] || "https://via.placeholder.com/150",
  imageUrl: data.imageUrl || [],
  deskripsi: data.deskripsi || ""
});

  });
  tampilkanKategori();
  filterDanTampilkanProduk();
});

function tampilkanKategori() {
  const kategoriUnik = ["Semua", ...new Set(semuaProduk.map(p => p.kategori))];
  kategoriList.innerHTML = "";
  kategoriUnik.forEach(kat => {
    const span = document.createElement("span");
    span.textContent = kat;
    span.className = "kategori-item" + (kat === kategoriAktif ? " active" : "");
    span.onclick = () => {
      kategoriAktif = kat;
      tampilkanKategori();
      filterDanTampilkanProduk();
    };
    kategoriList.appendChild(span);
  });
}

function filterDanTampilkanProduk() {
  const keyword = searchInput.value.toLowerCase();
  produkDitampilkan = semuaProduk.filter(p => {
    return (kategoriAktif === "Semua" || p.kategori === kategoriAktif) &&
           p.nama.toLowerCase().includes(keyword);
  });
  tampilkanProduk();
}

function tampilkanProduk() {
  produkGrid.innerHTML = "";
  produkDitampilkan.forEach(p => {
    const div = document.createElement("div");
    div.className = "produk-card";
    div.innerHTML = `
      <img src="${p.gambar}" alt="${p.nama}">
      <h4>${p.nama}</h4>
      <p>Rp ${p.harga.toLocaleString()}</p>
      <button onclick="tambahKePesanan('${p.id}', '${p.nama}', ${p.harga})">Tambah</button>
    `;
    div.addEventListener("click", (e) => {
      if (!e.target.matches("button")) {
        showPopup(p);
      }
    });
    produkGrid.appendChild(div);
  });
}

function tambahKePesanan(id, nama, harga) {
  const produk = semuaProduk.find(p => p.id === id);
  const index = produkDipilih.findIndex(p => p.id === id);

  if (index === -1) {
    produkDipilih.push({ id, nama, harga, jumlah: 1, gambar: produk.gambar });
  } else {
    produkDipilih[index].jumlah++;
  }

  updateRingkasan();
  localStorage.setItem("barangTerpilih", JSON.stringify(produkDipilih));
}
function simpanPesanan() {
  if (produkDipilih.length === 0) {
    alert("Tidak ada barang yang dipilih!");
    return;
  }

  const pesananData = {
    tanggal: new Date().toISOString(),
    produk: produkDipilih.map(p => ({
      id: p.id,
      nama: p.nama,
      harga: p.harga,
      jumlah: p.jumlah,
      gambar: p.gambar
    })),
    totalHarga: produkDipilih.reduce((sum, p) => sum + p.harga * p.jumlah, 0)
  };

  db.collection("pesanan")
    .add(pesananData)
    .then(docRef => {
      console.log("Pesanan disimpan dengan ID:", docRef.id);
      alert("Pesanan berhasil disimpan ke Firestore!");
      localStorage.removeItem("barangTerpilih");
      window.location.href = 'lihat_barang.html';
    })
    .catch(error => {
      console.error("Gagal simpan pesanan:", error);
      alert("Terjadi kesalahan saat menyimpan pesanan.");
    });
}

function updateRingkasan() {
  jumlahJenisEl.textContent = produkDipilih.length;
  const total = produkDipilih.reduce((sum, p) => sum + p.harga * p.jumlah, 0);
  subtotalHargaEl.textContent = total.toLocaleString();
}

searchInput.addEventListener("input", filterDanTampilkanProduk);

let popupSlideIndex = 0;
let popupGambarList = [];

function showPopup(p) {
  document.getElementById("popupNama").textContent = p.nama;
  document.getElementById("popupDeskripsiText").textContent = p.deskripsi || "Tidak ada deskripsi.";
  popupGambarList = (p.imageUrl?.length ? p.imageUrl : [p.gambar]);
  if (popupGambarList.length === 1) {
    popupGambarList = Array(4).fill(popupGambarList[0]);
  } else {
    popupGambarList = popupGambarList.slice(0, 4);
  }
  const wrapper = document.getElementById("popupGambarWrapper");
  wrapper.innerHTML = "";
  popupGambarList.forEach(url => {
    const img = document.createElement("img");
    img.src = url;
    wrapper.appendChild(img);
  });
  popupSlideIndex = 0;
  updatePopupSlide();
  document.getElementById("popupDeskripsi").style.display = "block";
}

function updatePopupSlide() {
  const wrapper = document.getElementById("popupGambarWrapper");
  wrapper.style.transform = `translateX(-${popupSlideIndex * 100}%)`;
}

document.getElementById("popupPrevBtn").onclick = () => {
  if (popupSlideIndex > 0) {
    popupSlideIndex--;
    updatePopupSlide();
  }
};
document.getElementById("popupNextBtn").onclick = () => {
  if (popupSlideIndex < popupGambarList.length - 1) {
    popupSlideIndex++;
    updatePopupSlide();
  }
};
