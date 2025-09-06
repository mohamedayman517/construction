using Microsoft.AspNetCore.Http;
using System.Threading;
using System.Threading.Tasks;

namespace ConstructionMarketplace.Services
{
    public class FileUploadResult
    {
        public string Url { get; set; } = string.Empty;
        public string PublicId { get; set; } = string.Empty;
        public string ResourceType { get; set; } = string.Empty;
        public long Bytes { get; set; }
    }

    public interface IFileStorageService
    {
        Task<FileUploadResult> UploadAsync(IFormFile file, string? folder = null, CancellationToken cancellationToken = default);
    }
}
