/**
 * TNS — Cloudinary Upload Utility
 * Handles image/video uploads to Cloudinary via unsigned upload.
 * Max 4 media items per event/announcement.
 */
(function () {
  'use strict';

  var MAX_MEDIA = 4;

  function getConfig() {
    var cfg = window.TNS_CLOUDINARY;
    if (!cfg || !cfg.cloudName || cfg.cloudName.indexOf('YOUR_') === 0) {
      return null;
    }
    return cfg;
  }

  /**
   * Upload a file to Cloudinary.
   * Returns { url, type, public_id } or throws.
   */
  async function uploadFile(file) {
    var cfg = getConfig();
    if (!cfg) throw new Error('Cloudinary not configured.');

    var formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cfg.uploadPreset);
    formData.append('folder', 'tns/events');

    var resourceType = file.type.startsWith('video/') ? 'video' : 'image';
    var url = 'https://api.cloudinary.com/v1_1/' + cfg.cloudName + '/' + resourceType + '/upload';

    var res = await fetch(url, { method: 'POST', body: formData });
    var data = await res.json();

    if (data.error) throw new Error(data.error.message);

    return {
      url: data.secure_url,
      type: resourceType,
      public_id: data.public_id,
      thumb: resourceType === 'image'
        ? data.secure_url.replace('/upload/', '/upload/w_400,h_250,c_fill/')
        : ''
    };
  }

  /**
   * Render media preview list inside a container.
   * mediaArr = [{ url, type, public_id, thumb }]
   */
  function renderMediaPreviews(container, mediaArr, onRemove) {
    container.innerHTML = '';
    if (!mediaArr.length) {
      container.innerHTML = '<p class="text-xs" style="color: var(--muted);">No media uploaded yet.</p>';
      return;
    }

    mediaArr.forEach(function (item, idx) {
      var wrapper = document.createElement('div');
      wrapper.className = 'relative group border rounded-lg overflow-hidden';
      wrapper.style.cssText = 'width: 120px; height: 90px;';

      if (item.type === 'video') {
        wrapper.innerHTML =
          '<video src="' + item.url + '" class="w-full h-full object-cover" muted></video>' +
          '<span class="absolute top-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded"><i class="fa-solid fa-video"></i></span>';
      } else {
        wrapper.innerHTML = '<img src="' + (item.thumb || item.url) + '" class="w-full h-full object-cover" alt="Uploaded media">';
      }

      var removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity';
      removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      removeBtn.addEventListener('click', function () { onRemove(idx); });

      wrapper.appendChild(removeBtn);
      container.appendChild(wrapper);
    });
  }

  /**
   * Initialize an upload zone for a form section.
   * Returns a controller: { getMedia(), clear() }
   */
  function initUploadZone(zoneId, previewId, statusId) {
    var zone = document.getElementById(zoneId);
    var preview = document.getElementById(previewId);
    var status = document.getElementById(statusId);
    var mediaArr = [];

    if (!zone) return { getMedia: function () { return mediaArr; }, clear: function () { mediaArr = []; if (preview) preview.innerHTML = ''; } };

    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,video/*';
    fileInput.multiple = true;
    fileInput.className = 'hidden';
    fileInput.addEventListener('change', handleFiles);
    zone.appendChild(fileInput);

    zone.addEventListener('click', function () {
      if (mediaArr.length >= MAX_MEDIA) {
        alert('Maximum ' + MAX_MEDIA + ' media items allowed.');
        return;
      }
      fileInput.click();
    });

    zone.addEventListener('dragover', function (e) { e.preventDefault(); zone.classList.add('border-gold', 'bg-gold/5'); });
    zone.addEventListener('dragleave', function () { zone.classList.remove('border-gold', 'bg-gold/5'); });
    zone.addEventListener('drop', function (e) {
      e.preventDefault();
      zone.classList.remove('border-gold', 'bg-gold/5');
      handleFiles({ target: { files: e.dataTransfer.files } });
    });

    async function handleFiles(e) {
      var files = Array.from(e.target.files || []);
      if (!files.length) return;

      var remaining = MAX_MEDIA - mediaArr.length;
      if (remaining <= 0) {
        alert('Maximum ' + MAX_MEDIA + ' media items allowed.');
        return;
      }

      files = files.slice(0, remaining);

      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (file.size > 50 * 1024 * 1024) {
          alert(file.name + ' is too large (max 50MB).');
          continue;
        }
        if (status) status.textContent = 'Uploading ' + (i + 1) + ' of ' + files.length + '...';
        try {
          var result = await uploadFile(file);
          mediaArr.push(result);
        } catch (err) {
          alert('Upload failed: ' + err.message);
        }
      }

      if (status) status.textContent = '';
      fileInput.value = '';
      renderMediaPreviews(preview, mediaArr, function (idx) {
        mediaArr.splice(idx, 1);
        renderMediaPreviews(preview, mediaArr, arguments.callee);
      });
    }

    return {
      getMedia: function () { return mediaArr; },
      clear: function () {
        mediaArr = [];
        renderMediaPreviews(preview, mediaArr, function () {});
      }
    };
  }

  window.TNS_CloudinaryUpload = {
    getConfig: getConfig,
    uploadFile: uploadFile,
    renderPreviews: renderMediaPreviews,
    initUploadZone: initUploadZone,
    MAX_MEDIA: MAX_MEDIA
  };
})();
