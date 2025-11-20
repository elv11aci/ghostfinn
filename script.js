// Data sementara untuk simulasi
let laporanBarang = JSON.parse(localStorage.getItem('laporanBarang')) || [];

// Data sample untuk demo - KOSONGKAN
if (laporanBarang.length === 0) {
    laporanBarang = []; // Array kosong
    saveToLocalStorage();
}

// Fungsi untuk validasi kode 4 digit
function validasiKode(kode) {
    return /^\d{4}$/.test(kode); // Harus tepat 4 digit angka
}

// Fungsi untuk menyimpan ke localStorage
function saveToLocalStorage() {
    localStorage.setItem('laporanBarang', JSON.stringify(laporanBarang));
}

// Variabel untuk pagination
let currentPage = 1;
const itemsPerPage = 6;
let currentFilter = 'all';

// Handle form laporan hilang - DENGAN INPUT KODE USER
document.addEventListener('DOMContentLoaded', function() {
    const formHilang = document.getElementById('formHilang');
    const formTemuan = document.getElementById('formTemuan');
    const homeSearch = document.getElementById('homeSearch');

    // Set tanggal default ke hari ini
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.value) input.value = today;
    });

    if (formHilang) {
        formHilang.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Minta kode 4 digit dari user
            const kodeHapus = prompt('Buat kode hapus 4 digit angka (contoh: 1234):');
            
            if (!kodeHapus) {
                showNotification('Laporan dibatalkan. Kode hapus wajib diisi!', 'error');
                return;
            }
            
            if (!validasiKode(kodeHapus)) {
                showNotification('Kode harus 4 digit angka! Contoh: 1234', 'error');
                return;
            }
            
            const formData = {
                id: Date.now(),
                type: 'hilang',
                namaBarang: document.getElementById('namaBarang').value,
                kategori: document.getElementById('kategori').value,
                deskripsi: document.getElementById('deskripsi').value,
                lokasi: document.getElementById('lokasiHilang').value,
                tanggal: document.getElementById('tanggalHilang').value,
                kontak: document.getElementById('kontak').value,
                tanggalLapor: today,
                status: 'aktif',
                kodeHapus: kodeHapus
            };

            // Simpan dan langsung tampilkan
            laporanBarang.push(formData);
            saveToLocalStorage();

            showNotificationWithCode(
                'Laporan berhasil dikirim!', 
                'success',
                kodeHapus
            );
            
            formHilang.reset();
            document.getElementById('tanggalHilang').value = today;
            
            // REDIRECT KE HOMEPAGE SETELAH LAPOR
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
        });
    }

    if (formTemuan) {
        formTemuan.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Minta kode 4 digit dari user
            const kodeHapus = prompt('Buat kode hapus 4 digit angka (contoh: 1234):');
            
            if (!kodeHapus) {
                showNotification('Laporan dibatalkan. Kode hapus wajib diisi!', 'error');
                return;
            }
            
            if (!validasiKode(kodeHapus)) {
                showNotification('Kode harus 4 digit angka! Contoh: 1234', 'error');
                return;
            }
            
            const formData = {
                id: Date.now(),
                type: 'temuan',
                namaBarang: document.getElementById('namaBarangTemuan').value,
                kategori: document.getElementById('kategoriTemuan').value,
                deskripsi: document.getElementById('deskripsiTemuan').value,
                lokasiTemuan: document.getElementById('lokasiTemuan').value,
                lokasiSimpan: document.getElementById('lokasiSimpan').value,
                tanggal: document.getElementById('tanggalTemuan').value,
                kontak: document.getElementById('kontakTemuan').value,
                catatan: document.getElementById('catatanTambahan').value,
                tanggalLapor: today,
                status: 'aktif',
                kodeHapus: kodeHapus
            };

            // Simpan dan langsung tampilkan
            laporanBarang.push(formData);
            saveToLocalStorage();

            showNotificationWithCode(
                'Laporan temuan berhasil dikirim!', 
                'success',
                kodeHapus
            );
            
            formTemuan.reset();
            document.getElementById('tanggalTemuan').value = today;
            
            // REDIRECT KE HOMEPAGE SETELAH LAPOR
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
        });
    }

    // Event listener untuk search input di homepage
    if (homeSearch) {
        homeSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        // Real-time search saat mengetik
        let searchTimeout;
        homeSearch.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(performSearch, 500);
        });
    }

    // Tampilkan semua items di homepage
    displayAllItems();
    
    // Tampilkan statistik
    displayStats();
});

// FUNGSI BARU: Notifikasi dengan kode hapus yang menonjol
function showNotificationWithCode(message, type, kodeHapus) {
    const notification = document.createElement('div');
    notification.className = `notification ${type} code-notification`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <div class="kode-hapus-display">
                <strong>KODE HAPUS ANDA: <span class="kode-number">${kodeHapus}</span></strong>
            </div>
            <p class="kode-warning">⚠️ INGAT KODE INI! Anda butuh kode ini untuk menghapus laporan nanti.</p>
            <p class="kode-tip">💡 Tips: Screenshot atau catat kode ini di tempat aman!</p>
        </div>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    document.body.appendChild(notification);
    
    // Auto remove setelah 10 detik (lebih lama agar user sempat catat kode)
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 10000);
}

// FUNGSI BARU: Verifikasi kode hapus sebelum menghapus
function verifikasiDanHapus(itemId, type) {
    const item = laporanBarang.find(item => item.id === itemId);
    if (!item) return;

    const actionText = type === 'hilang' 
        ? 'konfirmasi barang sudah ditemukan' 
        : 'konfirmasi barang sudah diambil';
    
    const kodeInput = prompt(`Masukkan kode hapus 4 digit untuk ${actionText}:`);
    
    if (kodeInput === null) return; // User cancel
    
    if (kodeInput === item.kodeHapus) {
        // Kode benar, hapus laporan
        const itemIndex = laporanBarang.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            const deletedItem = laporanBarang.splice(itemIndex, 1)[0];
            saveToLocalStorage();
            
            showNotification(
                type === 'hilang' 
                    ? '✅ Barang hilang berhasil dihapus. Selamat barang sudah ditemukan!' 
                    : '✅ Barang temuan berhasil dihapus. Terima kasih sudah mengembalikan!',
                'success'
            );
            
            // Refresh tampilan
            displayAllItems();
            displayStats();
            
            // Sembunyikan hasil pencarian jika sedang terbuka
            const resultsContainer = document.getElementById('searchResults');
            if (resultsContainer) {
                resultsContainer.style.display = 'none';
            }
        }
    } else {
        // Kode salah
        if (kodeInput) {
            if (kodeInput.length !== 4) {
                showNotification('❌ Kode harus 4 digit angka!', 'error');
            } else {
                showNotification('❌ Kode hapus salah! Silakan coba lagi.', 'error');
            }
        }
    }
}

// FUNGSI PENCARIAN
function performSearch() {
    const searchTerm = document.getElementById('homeSearch').value.toLowerCase().trim();
    const resultsContainer = document.getElementById('searchResults');
    const resultsList = document.getElementById('resultsList');
    const resultsCount = document.getElementById('resultsCount');
    
    if (!resultsContainer || !resultsList || !resultsCount) {
        console.error('Element search results tidak ditemukan');
        return;
    }
    
    // Tampilkan loading
    resultsList.innerHTML = '<div class="loading">🔍 Mencari barang...</div>';
    resultsContainer.style.display = 'block';
    
    // Simulasi delay loading
    setTimeout(() => {
        const activeItems = laporanBarang.filter(item => item.status === 'aktif');
        
        if (searchTerm === '') {
            // Jika search kosong, tampilkan semua item
            displaySearchResults(activeItems, resultsList, resultsCount);
        } else {
            // Filter items berdasarkan kata kunci dari data laporanBarang
            const filteredItems = activeItems.filter(item => 
                item.namaBarang.toLowerCase().includes(searchTerm) ||
                item.deskripsi.toLowerCase().includes(searchTerm) ||
                (item.type === 'hilang' ? item.lokasi : item.lokasiTemuan).toLowerCase().includes(searchTerm) ||
                item.kategori.toLowerCase().includes(searchTerm)
            );
            
            displaySearchResults(filteredItems, resultsList, resultsCount);
        }
    }, 300);
}

// Fungsi untuk menampilkan hasil pencarian
function displaySearchResults(items, container, countElement) {
    if (items.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <div class="icon">🔍</div>
                <h4>Tidak ada barang yang ditemukan</h4>
                <p>Coba gunakan kata kunci yang lebih spesifik atau periksa ejaan</p>
            </div>
        `;
        countElement.textContent = '0 hasil';
        return;
    }
    
    countElement.textContent = `${items.length} hasil ditemukan`;
    
    container.innerHTML = items.map(item => `
        <div class="result-item" onclick="showItemDetail(${item.id})">
            <div class="item-header">
                <h3 class="item-name">${item.namaBarang}</h3>
                <span class="item-status ${item.type === 'hilang' ? 'status-hilang' : 'status-temuan'}">
                    ${item.type === 'hilang' ? '❌ Hilang' : '✅ Ditemukan'}
                </span>
            </div>
            <div class="item-description">${item.deskripsi}</div>
            <div class="item-meta">
                <div class="item-location">
                    <span>📍 ${item.type === 'hilang' ? item.lokasi : item.lokasiTemuan}</span>
                    <span class="item-category">${getKategoriLabel(item.kategori)}</span>
                </div>
                <div class="item-date">${formatTanggal(item.tanggalLapor)}</div>
            </div>
        </div>
    `).join('');
}

// Fungsi untuk menampilkan detail item
function showItemDetail(itemId) {
    const item = laporanBarang.find(i => i.id === itemId);
    if (item) {
        const detailMessage = `
📦 Detail Barang:

🏷️ Nama: ${item.namaBarang}
📝 Deskripsi: ${item.deskripsi}
📍 Lokasi: ${item.type === 'hilang' ? item.lokasi : item.lokasiTemuan}
${item.type === 'temuan' ? `🏠 Disimpan di: ${item.lokasiSimpan}` : ''}
📅 Tanggal: ${formatTanggal(item.tanggal)}
🔔 Status: ${item.type === 'hilang' ? 'Hilang' : 'Ditemukan'}
📞 Kontak: ${item.kontak}
${item.catatan ? `📋 Catatan: ${item.catatan}` : ''}
        `.trim();
        
        alert(detailMessage);
    }
}

// Fungsi untuk menampilkan semua barang di homepage
function displayAllItems() {
    const container = document.getElementById('allItemsContainer');
    if (!container) return;

    const activeItems = laporanBarang.filter(item => item.status === 'aktif');
    const filteredItems = filterItemsByType(activeItems, currentFilter);
    const itemsToShow = filteredItems.slice(0, currentPage * itemsPerPage);

    if (filteredItems.length === 0) {
        container.innerHTML = `
            <div class="no-items">
                <h3>${currentFilter === 'all' ? 'Belum ada laporan' : `Tidak ada laporan ${currentFilter}`}</h3>
                <p>${currentFilter === 'all' ? 'Jadilah yang pertama melaporkan barang hilang atau temuan!' : `Tidak ada laporan barang ${currentFilter} saat ini.`}</p>
                <a href="${currentFilter === 'temuan' ? 'laportemuan.html' : 'laporhilang.html'}" class="btn btn-primary">
                    ${currentFilter === 'all' ? 'Buat Laporan Pertama' : `Lapor Barang ${currentFilter}`}
                </a>
            </div>
        `;
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
    }

    container.innerHTML = itemsToShow.map(item => `
        <div class="item-card ${item.type}">
            <div class="item-badge">${item.type === 'hilang' ? '🔍 BARANG HILANG' : '🎯 BARANG TEMUAN'}</div>
            <div class="item-status status-aktif">🟢 SEDANG DICARI</div>
            
            <h3>${item.namaBarang}</h3>
            
            <div class="item-details">
                <p><strong>Kategori:</strong> <span class="kategori">${getKategoriLabel(item.kategori)}</span></p>
                <p><strong>Deskripsi:</strong> ${item.deskripsi}</p>
                <p><strong>Lokasi:</strong> ${item.type === 'hilang' ? item.lokasi : item.lokasiTemuan}</p>
                ${item.type === 'temuan' ? `<p><strong>Disimpan di:</strong> ${item.lokasiSimpan}</p>` : ''}
                ${item.catatan ? `<p><strong>Catatan:</strong> ${item.catatan}</p>` : ''}
            </div>
            
            <div class="item-meta">
                <span class="item-date">📅 Dilaporkan: ${formatTanggal(item.tanggalLapor)}</span>
                <span class="item-contact">📞 ${item.kontak}</span>
            </div>
            
            <!-- TOMBOL KONFIRMASI DENGAN SISTEM KODE -->
            <div class="konfirmasi-actions">
                <button onclick="verifikasiDanHapus(${item.id}, '${item.type}')" class="btn-konfirmasi">
                    ${item.type === 'hilang' ? '✅ Barang Sudah Ditemukan' : '✅ Barang Sudah Diambil'}
                </button>
                <button onclick="showContact('${item.kontak}')" class="btn-hubungi">
                    📞 Hubungi Pelapor
                </button>
            </div>
            
            <!-- Info untuk debugging -->
            <div class="kode-info" style="font-size: 10px; color: #666; margin-top: 5px;">
                ID: ${item.id}
            </div>
        </div>
    `).join('');

    // Tampilkan/tombol load more
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        if (itemsToShow.length >= filteredItems.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }
}

// FUNGSI BARU: Untuk mencari laporan berdasarkan kode (fitur bantuan)
function cariLaporanByKode() {
    const kodeCari = prompt('Masukkan kode hapus 4 digit laporan yang ingin dicari:');
    if (!kodeCari) return;
    
    if (!validasiKode(kodeCari)) {
        alert('Kode harus 4 digit angka!');
        return;
    }
    
    const laporan = laporanBarang.find(item => item.kodeHapus === kodeCari);
    if (laporan) {
        const detail = `
📦 LAPORAN DITEMUKAN:

🏷️ Nama Barang: ${laporan.namaBarang}
📝 Deskripsi: ${laporan.deskripsi}
📍 Lokasi: ${laporan.type === 'hilang' ? laporan.lokasi : laporan.lokasiTemuan}
${laporan.type === 'temuan' ? `🏠 Disimpan di: ${laporan.lokasiSimpan}` : ''}
📅 Tanggal: ${formatTanggal(laporan.tanggal)}
🔔 Status: ${laporan.type === 'hilang' ? 'Hilang' : 'Ditemukan'}
📞 Kontak: ${laporan.kontak}
🆔 Kode Hapus: ${laporan.kodeHapus}
${laporan.catatan ? `📋 Catatan: ${laporan.catatan}` : ''}
        `.trim();
        
        alert(detail);
    } else {
        alert('❌ Tidak ditemukan laporan dengan kode tersebut.');
    }
}

// Fungsi bantuan
function getKategoriLabel(kategori) {
    const labels = {
        'elektronik': '📱 Elektronik',
        'dompet': '👛 Dompet',
        'kunci': '🔑 Kunci',
        'tas': '🎒 Tas',
        'ponsel': '📱 Ponsel',
        'dokumen': '📄 Dokumen',
        'perhiasan': '💍 Perhiasan',
        'pakaian': '👕 Pakaian',
        'lainnya': '📦 Lainnya'
    };
    return labels[kategori] || kategori;
}

function formatTanggal(tanggal) {
    return new Date(tanggal).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function showContact(kontak) {
    alert(`Informasi Kontak: ${kontak}\n\nSilakan hubungi melalui nomor/email di atas.`);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
}

function filterItems(type) {
    currentFilter = type;
    currentPage = 1;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    displayAllItems();
}

function filterItemsByType(items, type) {
    if (type === 'all') return items;
    return items.filter(item => item.type === type);
}

function loadMoreItems() {
    currentPage++;
    displayAllItems();
}

function displayStats() {
    const statsContainer = document.getElementById('statsContainer');
    if (!statsContainer) return;

    const totalAktif = laporanBarang.filter(item => item.status === 'aktif').length;
    const totalHilang = laporanBarang.filter(item => item.type === 'hilang' && item.status === 'aktif').length;
    const totalTemuan = laporanBarang.filter(item => item.type === 'temuan' && item.status === 'aktif').length;

    statsContainer.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <h3>${totalAktif}</h3>
                <p>Laporan Aktif</p>
            </div>
            <div class="stat-card">
                <h3>${totalHilang}</h3>
                <p>Barang Hilang</p>
            </div>
            <div class="stat-card">
                <h3>${totalTemuan}</h3>
                <p>Barang Temuan</p>
            </div>
        </div>
    `;
}

// Tambahkan event listener untuk klik outside search results
document.addEventListener('click', function(e) {
    const resultsContainer = document.getElementById('searchResults');
    const searchInput = document.getElementById('homeSearch');
    
    if (resultsContainer && searchInput && 
        !searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
        resultsContainer.style.display = 'none';
    }
});

// Tambahkan button cari kode di console untuk testing
console.log('Fungsi bantuan: cariLaporanByKode() - untuk mencari laporan by kode hapus');

// Fungsi untuk set active menu berdasarkan halaman saat ini
function setActiveMenu() {
    console.log('Setting active menu...');
    
    // Dapatkan nama file halaman saat ini
    const currentPage = window.location.pathname.split('/').pop();
    console.log('Current page:', currentPage);
    
    const navLinks = document.querySelectorAll('.nav-link');
    console.log('Found nav links:', navLinks.length);
    
    // Reset semua menu
    navLinks.forEach(link => {
        link.classList.remove('active');
        console.log('Removed active from:', link.getAttribute('href'));
    });
    
    // Set active berdasarkan halaman saat ini
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        console.log('Checking link:', linkHref);
        
        // Logic untuk menentukan active menu
        if ((currentPage === '' || currentPage === 'index.html') && linkHref === 'index.html') {
            link.classList.add('active');
            console.log('Set active: Home');
        } else if (linkHref === currentPage) {
            link.classList.add('active');
            console.log('Set active:', linkHref);
        }
    });
}

// Panggil fungsi saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing active menu');
    setActiveMenu();
});

// Juga panggil saat halaman fully loaded (untuk memastikan)
window.addEventListener('load', function() {
    console.log('Page fully loaded - finalizing active menu');
    setActiveMenu();
});