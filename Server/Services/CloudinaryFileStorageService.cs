using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using ConstructionMarketplace.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace ConstructionMarketplace.Services
{
    public class CloudinaryFileStorageService : IFileStorageService
    {
        private readonly Cloudinary _cloudinary;
        private readonly FileUploadSettings _fileUploadSettings;

        public CloudinaryFileStorageService(
            IOptions<CloudinarySettings> cloudinaryOptions,
            IOptions<FileUploadSettings> fileUploadOptions)
        {
            var cfg = cloudinaryOptions.Value;
            var account = new Account(cfg.CloudName, cfg.ApiKey, cfg.ApiSecret);
            _cloudinary = new Cloudinary(account)
            {
                Api = { Secure = true }
            };
            _fileUploadSettings = fileUploadOptions.Value;
        }

        public async Task<FileUploadResult> UploadAsync(IFormFile file, string? folder = null, CancellationToken cancellationToken = default)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty.");

            if (file.Length > _fileUploadSettings.MaxFileSize)
                throw new InvalidOperationException($"File exceeds maximum size of {_fileUploadSettings.MaxFileSize} bytes.");

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (_fileUploadSettings.AllowedExtensions?.Any() == true && !_fileUploadSettings.AllowedExtensions.Contains(extension))
                throw new InvalidOperationException($"Extension '{extension}' is not allowed.");

            await using var stream = file.OpenReadStream();

            // Auto-detect resource type (image, video, raw)
            var uploadParams = new AutoUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = string.IsNullOrWhiteSpace(folder) ? null : folder,
                UseFilename = true,
                UniqueFilename = true,
            };

            var result = await _cloudinary.UploadAsync(uploadParams, cancellationToken);

            if ((int)result.StatusCode >= 400 || result.Error != null)
                throw new InvalidOperationException($"Cloudinary upload failed: {result.Error?.Message}");

            return new FileUploadResult
            {
                Url = result.SecureUrl?.ToString() ?? result.Url?.ToString() ?? string.Empty,
                PublicId = result.PublicId ?? string.Empty,
                ResourceType = result.ResourceType ?? string.Empty,
                Bytes = result.Bytes
            };
        }
    }
}
