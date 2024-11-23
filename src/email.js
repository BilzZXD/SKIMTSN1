// Initialize EmailJS
  emailjs.init("RQ6W_zDc3Wbtu4X1m"); // Public Key Anda

  let uploadedFiles = []; // Menyimpan file yang diunggah
  const maxFileSize = 5 * 1024 * 1024; // Max file size 5MB

  // Handle Drop Event
  function handleDrop(event) {
      event.preventDefault();
      const files = event.dataTransfer.files;
      for (let file of files) {
          if (uploadedFiles.length < 5 && file.size <= maxFileSize) {
              uploadedFiles.push(file);
              displayFile(file);
          } else if (file.size > maxFileSize) {
              Swal.fire({
                  icon: 'error',
                  title: 'File terlalu besar!',
                  text: `File ${file.name} terlalu besar, maksimum 5MB!`,
                  confirmButtonColor: '#e53e3e',
              });
          } else {
              Swal.fire({
                  icon: 'warning',
                  title: 'Maksimal file tercapai!',
                  text: 'Anda hanya dapat mengunggah maksimal 5 file.',
                  confirmButtonColor: '#3182ce',
              });
          }
      }
  }

// Display Uploaded File
function displayFile(file) {
    const fileList = document.getElementById("fileList");
    const fileItem = document.createElement("li");
    fileItem.classList.add("file-item"); // Tambahkan kelas untuk styling

    fileItem.innerHTML = `
        File: ${file.name} (${(file.size / 1024).toFixed(2)} KB)
        <button class="remove-file-btn" onclick="removeFile('${file.name}')">
            <i class="fas fa-trash-alt"></i> Hapus
        </button>
    `;
    fileList.appendChild(fileItem);
}

// Remove File
function removeFile(fileName) {
    // Filter untuk menghapus hanya file yang dipilih
    uploadedFiles = uploadedFiles.filter(file => file.name !== fileName);

    // Menampilkan ulang daftar file setelah penghapusan
    displayUploadedFiles();
}

// Menampilkan ulang daftar file yang sudah diunggah
function displayUploadedFiles() {
    const fileList = document.getElementById("fileList");
    fileList.innerHTML = ""; // Hapus daftar lama
    uploadedFiles.forEach(file => displayFile(file)); // Display file yang tersisa
}


  // Handle Drag Over Event (untuk memastikan file bisa di-drop)
  document.getElementById("dropzone").addEventListener("dragover", function (e) {
      e.preventDefault();
      document.getElementById("dropzone").classList.add("dragover");
  });

  // Handle Drag Leave Event
  document.getElementById("dropzone").addEventListener("dragleave", function () {
      document.getElementById("dropzone").classList.remove("dragover");
  });

  // Handle Form Submission
  document.getElementById("submissionForm").addEventListener("submit", function (e) {
      e.preventDefault();

      const studentName = document.getElementById("studentName").value;
      const studentEmail = document.getElementById("studentEmail").value;

      if (uploadedFiles.length === 0) {
          Swal.fire({
              icon: 'error',
              title: 'Gagal!',
              text: 'Harap unggah file sebelum mengirim!',
              confirmButtonColor: '#e53e3e',
          });
          return;
      }

      // Tampilkan loading spinner
      document.getElementById("loading").classList.remove("hidden");

    const templateParams = {
        from_name: studentName,
        from_email: studentEmail,
        message: `File yang dikirim: ${uploadedFiles.map(file => file.name).join(", ")}`
    };

    // Proses masing-masing file dan simpan ke templateParams
    const promises = uploadedFiles.map(file => {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = function () {
                templateParams[`file_data_${file.name}`] = reader.result.split(",")[1]; // Ambil data base64
                templateParams[`file_name_${file.name}`] = file.name; // Nama file
                resolve();
            };
            reader.onerror = reject;
            reader.readAsDataURL(file); // Baca file sebagai data URL
        });
    });

      // Kirim file melalui EmailJS setelah semua file diproses
      Promise.all(promises)
          .then(() => {
              emailjs.send("service_m82b0ae", "template_y472l3d", templateParams)
                  .then(
                      () => {
                          document.getElementById("loading").classList.add("hidden"); // Sembunyikan loader
                          Swal.fire({
                              icon: 'success',
                              title: 'Berhasil!',
                              text: 'Tugas berhasil dikirim!',
                              confirmButtonColor: '#38a169',
                          });
                          resetForm(); // Reset form setelah pengiriman berhasil
                      },
                      (error) => {
                          document.getElementById("loading").classList.add("hidden"); // Sembunyikan loader
                          Swal.fire({
                              icon: 'error',
                              title: 'Gagal!',
                              text: `Gagal mengirim tugas: ${error.text}`,
                              confirmButtonColor: '#e53e3e',
                          });
                      }
                  );
          })
          .catch(error => {
              document.getElementById("loading").classList.add("hidden");
              Swal.fire({
                  icon: 'error',
                  title: 'Terjadi kesalahan!',
                  text: 'Terjadi kesalahan dalam membaca file.',
                  confirmButtonColor: '#e53e3e',
              });
          });
  });

  function resetForm() {
      uploadedFiles = []; // Reset file yang diunggah
      document.getElementById("fileList").innerHTML = ""; // Bersihkan daftar file
      document.getElementById("dropzoneText").innerText = "Tarik dan letakkan file Anda di sini atau klik untuk mengunggah"; // Reset pesan
      document.getElementById("submissionForm").reset(); // Reset form
  }