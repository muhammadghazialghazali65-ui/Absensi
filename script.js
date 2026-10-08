// State Global Aplikasi
let mataKuliahList = JSON.parse(localStorage.getItem('mk_list')) || [
    { kode: 'IF2101', nama: 'Pemrograman Web' },
    { kode: 'IF2102', nama: 'Struktur Data & Algoritma' },
    { kode: 'IF2103', nama: 'Basis Data Lanjut' }
];
let absensiList = JSON.parse(localStorage.getItem('mhs_absen')) || [];
let riwayatList = JSON.parse(localStorage.getItem('mhs_riwayat')) || [];
let mahasiswaData = JSON.parse(localStorage.getItem('mhs_profil')) || null;

let adminPin = localStorage.getItem('admin_pin') || '1234';
let html5QrCode = null;

// Fungsi Utama Pilih Peran
function pilihPeran(peran) {
    if (peran === 'dosen') {
        let inputPin = prompt("🔒 Masukkan PIN Akses Dosen / Admin:\n(Default PIN awal: 1234)");
        if (inputPin === null) return;
        if (inputPin !== adminPin) {
            alert("❌ PIN Salah! Akses ke Portal Dosen ditolak.");
            return;
        }
    }

    const landingEl = document.getElementById('view-landing');
    const appEl = document.getElementById('view-app');
    
    if (landingEl) landingEl.classList.add('hidden');
    if (appEl) appEl.classList.remove('hidden');

    const badge = document.getElementById('role-title-badge');
    const secDosen = document.getElementById('section-dosen');
    const secMhs = document.getElementById('section-mahasiswa');
    const btnGantiPin = document.getElementById('btn-ganti-pin');

    if (peran === 'dosen') {
        if (badge) badge.innerText = "Mode Dosen (Privat)";
        if (secDosen) secDosen.classList.remove('hidden');
        if (secMhs) secMhs.classList.add('hidden');
        if (btnGantiPin) btnGantiPin.classList.remove('hidden');
        
        switchTabDosen('scanner');
        renderMataKuliah();
        renderAbsensi();
        renderRiwayat();
        updateDropdownMK();
    } else {
        if (badge) badge.innerText = "Portal Mahasiswa";
        if (secMhs) secMhs.classList.remove('hidden');
        if (secDosen) secDosen.classList.add('hidden');
        if (btnGantiPin) btnGantiPin.classList.add('hidden');
        
        if (mahasiswaData) {
            muatKartuMahasiswaKeTampilan();
        }
    }
}

function kembaliKeHome() {
    hentikanScan();
    const appEl = document.getElementById('view-app');
    const landingEl = document.getElementById('view-landing');
    
    if (appEl) appEl.classList.add('hidden');
    if (landingEl) landingEl.classList.remove('hidden');
}

// Navigasi Tab Dosen
function switchTabDosen(tab) {
    const subScanner = document.getElementById('subview-scanner');
    const subRiwayat = document.getElementById('subview-riwayat');
    const btnScanner = document.getElementById('tab-btn-scanner');
    const btnRiwayat = document.getElementById('tab-btn-riwayat');

    if (!subScanner || !subRiwayat) return;

    if (tab === 'scanner') {
        subScanner.classList.remove('hidden');
        subRiwayat.classList.add('hidden');
        if (btnScanner) btnScanner.className = "flex-1 py-2 px-4 rounded-xl text-xs font-semibold bg-white text-indigo-600 shadow-sm transition";
        if (btnRiwayat) btnRiwayat.className = "flex-1 py-2 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition";
    } else {
        subRiwayat.classList.remove('hidden');
        subScanner.classList.add('hidden');
        if (btnRiwayat) btnRiwayat.className = "flex-1 py-2 px-4 rounded-xl text-xs font-semibold bg-white text-indigo-600 shadow-sm transition";
        if (btnScanner) btnScanner.className = "flex-1 py-2 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition";
        renderRiwayat();
    }
}

// Ganti PIN Dosen
function ubahPinDosen() {
    let pinLama = prompt("Masukkan PIN saat ini:");
    if (pinLama === adminPin) {
        let pinBaru = prompt("Masukkan PIN Baru (minimal 4 karakter):");
        if (pinBaru && pinBaru.length >= 4) {
            adminPin = pinBaru;
            localStorage.setItem('admin_pin', adminPin);
            alert("✅ PIN Berhasil diubah!");
        } else {
            alert("❌ PIN baru minimal 4 karakter.");
        }
    } else if (pinLama !== null) {
        alert("❌ PIN lama salah!");
    }
}

// Kelola Mata Kuliah
function tambahMataKuliah(e) {
    e.preventDefault();
    const kode = document.getElementById('mk-kode').value.trim().toUpperCase();
    const nama = document.getElementById('mk-nama').value.trim();

    if (mataKuliahList.some(mk => mk.kode === kode)) {
        alert('Kode mata kuliah sudah ada!');
        return;
    }

    mataKuliahList.push({ kode, nama });
    localStorage.setItem('mk_list', JSON.stringify(mataKuliahList));

    document.getElementById('form-tambah-mk').reset();
    renderMataKuliah();
    updateDropdownMK();
}

function hapusMataKuliah(kode) {
    if (confirm(`Hapus mata kuliah ${kode}?`)) {
        mataKuliahList = mataKuliahList.filter(mk => mk.kode !== kode);
        localStorage.setItem('mk_list', JSON.stringify(mataKuliahList));
        renderMataKuliah();
        updateDropdownMK();
    }
}

function renderMataKuliah() {
    const container = document.getElementById('list-mk-badge');
    if (!container) return;
    if (mataKuliahList.length === 0) {
        container.innerHTML = `<span class="text-xs text-slate-400">Belum ada mata kuliah.</span>`;
        return;
    }
    container.innerHTML = mataKuliahList.map(mk => `
        <div class="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700">
            <span class="font-bold text-indigo-600">${mk.kode}</span>
            <span>${mk.nama}</span>
            <button onclick="hapusMataKuliah('${mk.kode}')" class="text-slate-400 hover:text-rose-600 ml-1 transition-colors"><i class="fa-solid fa-xmark"></i></button>
        </div>
    `).join('');
}

function updateDropdownMK() {
    const select = document.getElementById('scanner-mk');
    const filterMk = document.getElementById('filter-mk');
    
    const options = `<option value="">-- Pilih Mata Kuliah --</option>` +
        mataKuliahList.map(mk => `<option value="${mk.kode}">${mk.kode} - ${mk.nama}</option>`).join('');

    if (select) select.innerHTML = options;
    if (filterMk) filterMk.innerHTML = `<option value="">-- Semua Mata Kuliah --</option>` +
        mataKuliahList.map(mk => `<option value="${mk.kode}">${mk.kode} - ${mk.nama}</option>`).join('');
}

// Scanner Dosen
function mulaiScan() {
    const kodeMk = document.getElementById('scanner-mk').value;
    if (!kodeMk) {
        alert('Silakan pilih mata kuliah yang sedang berlangsung terlebih dahulu!');
        return;
    }

    const statusEl = document.getElementById('scan-status');
    statusEl.className = "text-xs text-center font-medium text-amber-700 bg-amber-50 p-3.5 rounded-2xl border border-amber-200";
    statusEl.innerText = "Mengaktifkan kamera...";

    html5QrCode = new Html5Qrcode("reader");
    html5QrCode.start(
        { facingMode: "environment" }, 
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
            handleScanSuccess(decodedText, kodeMk);
        },
        (errorMessage) => {}
    ).catch(err => {
        statusEl.className = "text-xs text-center font-medium text-rose-700 bg-rose-50 p-3.5 rounded-2xl border border-rose-200";
        statusEl.innerText = "Gagal mengakses kamera. Pastikan izin kamera browser diaktifkan.";
    });

    statusEl.className = "text-xs text-center font-medium text-emerald-700 bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200";
    statusEl.innerText = "Kamera aktif. Silakan arahkan ke QR Code Kartu Mahasiswa.";
}

function hentikanScan() {
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            const statusEl = document.getElementById('scan-status');
            if (statusEl) {
                statusEl.className = "text-xs text-center font-medium text-slate-500 bg-slate-50 p-3.5 rounded-2xl border border-slate-200";
                statusEl.innerText = "Kamera dihentikan.";
            }
        }).catch(err => {});
    }
}

function handleScanSuccess(decodedText, kodeMk) {
    try {
        let dataMhs = JSON.parse(decodedText);
        let nim = dataMhs.nim;
        let nama = dataMhs.nama;

        const mkObj = mataKuliahList.find(m => m.kode === kodeMk);
        const now = new Date();
        const tanggal = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        const waktu = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const timestampFull = `${tanggal}, ${waktu}`;

        const sudahAbsen = absensiList.some(a => a.nim === nim && a.kodeMk === kodeMk);
        if (sudahAbsen) {
            const statusEl = document.getElementById('scan-status');
            statusEl.className = "text-xs text-center font-medium text-amber-700 bg-amber-50 p-3.5 rounded-2xl border border-amber-200";
            statusEl.innerText = `⚠️ ${nama} (${nim}) sudah tercatat hadir sebelumnya!`;
            return;
        }

        const dataAbsenBaru = {
            waktu: timestampFull,
            kodeMk,
            namaMk: mkObj.nama,
            nim,
            nama,
            status: 'Hadir'
        };

        absensiList.unshift(dataAbsenBaru);
        riwayatList.unshift(dataAbsenBaru);

        localStorage.setItem('mhs_absen', JSON.stringify(absensiList));
        localStorage.setItem('mhs_riwayat', JSON.stringify(riwayatList));
        
        renderAbsensi();

        const statusEl = document.getElementById('scan-status');
        statusEl.className = "text-xs text-center font-medium text-emerald-700 bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200";
        statusEl.innerText = `✅ Berhasil Absen: ${nama} (${nim})`;

    } catch (e) {
        const statusEl = document.getElementById('scan-status');
        statusEl.className = "text-xs text-center font-medium text-rose-700 bg-rose-50 p-3.5 rounded-2xl border border-rose-200";
        statusEl.innerText = "❌ Format QR Code tidak valid!";
    }
}

function renderAbsensi() {
    const tbody = document.getElementById('tabel-absen-body');
    if (!tbody) return;
    if (absensiList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-slate-400">Belum ada mahasiswa yang diabsen di sesi ini.</td></tr>`;
        return;
    }
    tbody.innerHTML = absensiList.map(a => `
        <tr class="hover:bg-slate-50 transition-colors">
            <td class="p-3.5 text-slate-500 text-xs">${a.waktu}</td>
            <td class="p-3.5 font-medium text-slate-700">${a.namaMk}</td>
            <td class="p-3.5 font-mono font-semibold text-indigo-600">${a.nim}</td>
            <td class="p-3.5 font-medium text-slate-800">${a.nama}</td>
            <td class="p-3.5 text-center"><span class="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">${a.status}</span></td>
        </tr>
    `).join('');
}

function resetAbsenLive() {
    if (confirm('Reset log sesi aktif ini? (Arsip riwayat permanen tetap aman)')) {
        absensiList = [];
        localStorage.removeItem('mhs_absen');
        renderAbsensi();
    }
}

// Render Riwayat & Filter
function renderRiwayat() {
    const tbody = document.getElementById('tabel-riwayat-body');
    if (!tbody) return;

    const searchInput = document.getElementById('search-riwayat');
    const filterMkInput = document.getElementById('filter-mk');

    const keyword = searchInput ? searchInput.value.toLowerCase() : "";
    const selectedMk = filterMkInput ? filterMkInput.value : "";

    let filtered = riwayatList.filter(item => {
        const matchKeyword = item.nama.toLowerCase().includes(keyword) || item.nim.toLowerCase().includes(keyword);
        const matchMk = selectedMk === "" || item.kodeMk === selectedMk;
        return matchKeyword && matchMk;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-slate-400">Tidak ada riwayat yang cocok dengan pencarian.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(a => `
        <tr class="hover:bg-slate-50 transition-colors">
            <td class="p-3.5 text-slate-500 text-xs">${a.waktu}</td>
            <td class="p-3.5 font-medium text-slate-700">${a.namaMk}</td>
            <td class="p-3.5 font-mono font-semibold text-indigo-600">${a.nim}</td>
            <td class="p-3.5 font-medium text-slate-800">${a.nama}</td>
            <td class="p-3.5 text-center"><span class="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-semibold">${a.status}</span></td>
        </tr>
    `).join('');
}

// Download Excel / CSV
function exportToCSV() {
    if (riwayatList.length === 0) {
        alert("Belum ada data riwayat untuk diexport!");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,Waktu,Kode MK,Mata Kuliah,NIM,Nama Mahasiswa,Status\n";
    
    riwayatList.forEach(row => {
        csvContent += `"${row.waktu}","${row.kodeMk}","${row.namaMk}","${row.nim}","${row.nama}","${row.status}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Absensi_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function clearAllHistory() {
    if (confirm('⚠️ PERINGATAN: Hapus seluruh arsip riwayat absensi secara permanen?')) {
        riwayatList = [];
        absensiList = [];
        localStorage.removeItem('mhs_riwayat');
        localStorage.removeItem('mhs_absen');
        renderRiwayat();
        renderAbsensi();
    }
}

// Portal Mahasiswa
function simpanKartuMahasiswa(e) {
    e.preventDefault();
    const nim = document.getElementById('mhs-input-nim').value.trim();
    const nama = document.getElementById('mhs-input-nama').value.trim();
    const kelas = document.getElementById('mhs-input-kelas').value.trim();

    mahasiswaData = {
        nim,
        nama,
        kelas,
        qrPayload: JSON.stringify({ nim, nama })
    };

    localStorage.setItem('mhs_profil', JSON.stringify(mahasiswaData));
    muatKartuMahasiswaKeTampilan();
}

function muatKartuMahasiswaKeTampilan() {
    const formEl = document.getElementById('form-mhs-single');
    if (formEl && formEl.parentElement) formEl.parentElement.classList.add('hidden');
    
    const kartuContainer = document.getElementById('kartu-digital-container');
    if (kartuContainer) kartuContainer.classList.remove('hidden');

    const displayNama = document.getElementById('display-nama');
    const displayNim = document.getElementById('display-nim');
    const displayKelas = document.getElementById('display-kelas');

    if (displayNama) displayNama.innerText = mahasiswaData.nama;
    if (displayNim) displayNim.innerText = mahasiswaData.nim;
    if (displayKelas) displayKelas.innerText = mahasiswaData.kelas;

    const qrEl = document.getElementById('qrcode-mahasiswa-besar');
    if (qrEl) {
        qrEl.innerHTML = ''; 
        new QRCode(qrEl, {
            text: mahasiswaData.qrPayload,
            width: 180,
            height: 180,
            colorDark : "#0f172a",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.M
        });
    }
}

function editKartuMahasiswa() {
    localStorage.removeItem('mhs_profil');
    mahasiswaData = null;
    const kartuContainer = document.getElementById('kartu-digital-container');
    const formEl = document.getElementById('form-mhs-single');

    if (kartuContainer) kartuContainer.classList.add('hidden');
    if (formEl && formEl.parentElement) formEl.parentElement.classList.remove('hidden');
}