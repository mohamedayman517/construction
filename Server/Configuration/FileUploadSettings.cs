using System.Collections.Generic;

namespace ConstructionMarketplace.Configuration
{
    public class FileUploadSettings
    {
        public long MaxFileSize { get; set; } = 10 * 1024 * 1024; // 10 MB default
        public List<string> AllowedExtensions { get; set; } = new List<string>();
        public string UploadPath { get; set; } = "wwwroot/uploads";
    }
}
