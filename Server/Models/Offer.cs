using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionMarketplace.Models
{
    public class Offer
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string TechnicianId { get; set; } = string.Empty;
        public string TargetType { get; set; } = "service"; // service|project
        public int? ServiceId { get; set; }
        public int? ProjectId { get; set; }
        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }
        [Range(1, int.MaxValue)]
        public int Days { get; set; }
        [MaxLength(1000)]
        public string? Message { get; set; }
        public string Status { get; set; } = "pending";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(TechnicianId))]
        public ApplicationUser? Technician { get; set; }
    }
}
