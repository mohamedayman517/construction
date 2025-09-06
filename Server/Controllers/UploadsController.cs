using ConstructionMarketplace.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

namespace ConstructionMarketplace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UploadsController : ControllerBase
    {
        private readonly IFileStorageService _fileStorage;
        private readonly ILogger<UploadsController> _logger;

        public UploadsController(IFileStorageService fileStorage, ILogger<UploadsController> logger)
        {
            _fileStorage = fileStorage;
            _logger = logger;
        }

        /// <summary>
        /// Upload a single file to Cloudinary and return its URL and public ID
        /// </summary>
        [HttpPost]
        [Authorize]
        [RequestSizeLimit(50_000_000)] // 50 MB hard ceiling; actual limit enforced by settings
        public async Task<IActionResult> Upload([FromForm] IFormFile file, [FromQuery] string? folder = null)
        {
            try
            {
                if (file == null)
                {
                    return BadRequest(new { success = false, message = "No file provided." });
                }

                var result = await _fileStorage.UploadAsync(file, folder);
                return Ok(new { success = true, url = result.Url, publicId = result.PublicId, bytes = result.Bytes, resourceType = result.ResourceType });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading file to Cloudinary");
                return StatusCode(400, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Upload multiple files to Cloudinary and return their URLs and public IDs
        /// </summary>
        [HttpPost("batch")]
        [Authorize]
        [RequestSizeLimit(200_000_000)] // 200 MB hard ceiling for batches
        public async Task<IActionResult> UploadBatch([FromForm] List<IFormFile> files, [FromQuery] string? folder = null)
        {
            try
            {
                if (files == null || files.Count == 0)
                {
                    return BadRequest(new { success = false, message = "No files provided." });
                }

                var results = new List<object>();
                foreach (var f in files)
                {
                    var r = await _fileStorage.UploadAsync(f, folder);
                    results.Add(new { url = r.Url, publicId = r.PublicId, bytes = r.Bytes, resourceType = r.ResourceType, fileName = f.FileName });
                }

                return Ok(new { success = true, items = results });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading files to Cloudinary");
                return StatusCode(400, new { success = false, message = ex.Message });
            }
        }
    }
}
