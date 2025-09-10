using System.ComponentModel.DataAnnotations;

namespace ConstructionMarketplace.Models
{
    public class AdminSettingEntry
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Key { get; set; } = string.Empty; // e.g., service_categories, product_categories

        [Required]
        public string JsonValue { get; set; } = "[]"; // JSON serialized array of strings or structured data

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
