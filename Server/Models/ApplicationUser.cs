using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace ConstructionMarketplace.Models
{
    public class ApplicationUser : IdentityUser
    {
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? MiddleName { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        [MaxLength(50)]
        public string? City { get; set; }

        [MaxLength(50)]
        public string? Country { get; set; }

        [MaxLength(20)]
        public string? PostalCode { get; set; }

        [MaxLength(20)]
        public string? PhoneSecondary { get; set; }

        // Detailed address (optional for merchants)
        [MaxLength(50)]
        public string? BuildingNumber { get; set; }

        [MaxLength(200)]
        public string? StreetName { get; set; }

        public DateTime DateOfBirth { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public bool IsActive { get; set; } = true;

        [MaxLength(500)]
        public string? ProfilePicture { get; set; }

        [MaxLength(1000)]
        public string? Bio { get; set; }

        // Business-specific properties
        public decimal? Rating { get; set; }

        public int ReviewCount { get; set; } = 0;

        [MaxLength(100)]
        public string? CompanyName { get; set; }

        [MaxLength(50)]
        public string? TaxNumber { get; set; }

        [MaxLength(100)]
        public string? LicenseNumber { get; set; }

        [MaxLength(34)]
        public string? Iban { get; set; }

        [MaxLength(50)]
        public string? RegistryStart { get; set; }

        [MaxLength(50)]
        public string? RegistryEnd { get; set; }

        // Optional stored file paths for vendor documents/images
        [MaxLength(300)]
        public string? VendorDocumentPath { get; set; }

        [MaxLength(300)]
        public string? VendorLicenseImagePath { get; set; }

        public bool IsVerified { get; set; } = false;

        public DateTime? VerificationDate { get; set; }

        // Subscription for accounting features
        public bool HasAccountingSubscription { get; set; } = false;

        public DateTime? SubscriptionStartDate { get; set; }

        public DateTime? SubscriptionEndDate { get; set; }

        // Navigation properties
        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
        public virtual ICollection<Project> CustomerProjects { get; set; } = new List<Project>();
        public virtual ICollection<Bid> Bids { get; set; } = new List<Bid>();
        public virtual ICollection<ServiceRequest> ServiceRequests { get; set; } = new List<ServiceRequest>();
        public virtual ICollection<ServiceApplication> ServiceApplications { get; set; } = new List<ServiceApplication>();
        public virtual ICollection<Rental> CustomerRentals { get; set; } = new List<Rental>();
        public virtual ICollection<Rental> MerchantRentals { get; set; } = new List<Rental>();
        public virtual ICollection<Review> GivenReviews { get; set; } = new List<Review>();
        public virtual ICollection<Review> ReceivedReviews { get; set; } = new List<Review>();
        public virtual ICollection<Invoice> CustomerInvoices { get; set; } = new List<Invoice>();
        public virtual ICollection<Invoice> MerchantInvoices { get; set; } = new List<Invoice>();
        public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();
        public virtual ICollection<Salary> Salaries { get; set; } = new List<Salary>();
    }
}

