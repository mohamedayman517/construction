using System.ComponentModel.DataAnnotations;

namespace ConstructionMarketplace.DTOs
{
    public class AddProductImageDto
    {
        [Required]
        [MaxLength(500)]
        public string ImageUrl { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? AltText { get; set; }

        public bool IsPrimary { get; set; } = false;

        public int SortOrder { get; set; } = 0;
    }

    public class AddProjectImageDto
    {
        [Required]
        [MaxLength(500)]
        public string ImageUrl { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Description { get; set; }

        public int SortOrder { get; set; } = 0;
    }
}
