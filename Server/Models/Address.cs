using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionMarketplace.Models
{
    public class Address
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string UserId { get; set; } = string.Empty;
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty; // label e.g., Home, Work
        [Required, MaxLength(500)]
        public string FullAddress { get; set; } = string.Empty;
        [Phone]
        public string Phone { get; set; } = string.Empty;
        public bool IsDefault { get; set; }

        [ForeignKey(nameof(UserId))]
        public ApplicationUser? User { get; set; }
    }
}
