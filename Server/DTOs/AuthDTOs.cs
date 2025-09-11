using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace ConstructionMarketplace.DTOs
{
    public class LoginDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        public bool RememberMe { get; set; } = false;
    }

    public class RegisterDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [Compare("Password")]
        public string ConfirmPassword { get; set; } = string.Empty;

        // Name triplet (first/middle/last). First and Last are required.
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string MiddleName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = string.Empty; // Customer, Merchant, Technician

        [Phone]
        public string? PhoneNumber { get; set; }

        [Phone]
        public string? PhoneSecondary { get; set; }

        // Address breakdown
        [MaxLength(50)]
        public string? BuildingNumber { get; set; }

        [MaxLength(200)]
        public string? StreetName { get; set; }

        [MaxLength(50)]
        public string? CityName { get; set; }

        [MaxLength(20)]
        public string? PostalCode { get; set; }

        // Optional tax/registry
        [MaxLength(50)]
        public string? TaxNumber { get; set; }

        [MaxLength(50)]
        public string? RegistryStart { get; set; }

        [MaxLength(50)]
        public string? RegistryEnd { get; set; }

        // Optional IBAN
        [MaxLength(34)]
        public string? Iban { get; set; }

        // Legacy/general fields (optional)
        [MaxLength(500)]
        public string? Address { get; set; }

        [MaxLength(50)]
        public string? City { get; set; }

        [MaxLength(50)]
        public string? Country { get; set; }

        [MaxLength(100)]
        public string? CompanyName { get; set; }

        public DateTime? DateOfBirth { get; set; }

        // Technician specific
        [MaxLength(50)]
        public string? Profession { get; set; }

        // Optional uploads for vendor (files)
        public IFormFile? DocumentFile { get; set; }
        public IFormFile? ImageFile { get; set; }
        public IFormFile? LicenseImage { get; set; }

        // Optional URLs (Cloudinary) as an alternative to file uploads
        [MaxLength(500)]
        public string? ProfilePictureUrl { get; set; }

        [MaxLength(500)]
        public string? VendorDocumentUrl { get; set; }

        [MaxLength(500)]
        public string? VendorLicenseImageUrl { get; set; }
    }

    public class AuthResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Token { get; set; }
        public DateTime? TokenExpiration { get; set; }
        public UserDto? User { get; set; }
    }

    public class UserDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? MiddleName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? PhoneSecondary { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public string? PostalCode { get; set; }
        public string? BuildingNumber { get; set; }
        public string? StreetName { get; set; }
        public string? CompanyName { get; set; }
        public string? Iban { get; set; }
        public string? RegistryStart { get; set; }
        public string? RegistryEnd { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public bool IsVerified { get; set; }
        public bool IsActive { get; set; }
        public decimal? Rating { get; set; }
        public int ReviewCount { get; set; }
        public bool HasAccountingSubscription { get; set; }
        public DateTime? SubscriptionEndDate { get; set; }
        public List<string> Roles { get; set; } = new List<string>();
        public DateTime CreatedAt { get; set; }
        public string? ProfilePicture { get; set; }
        public string? VendorDocumentPath { get; set; }
        public string? VendorLicenseImagePath { get; set; }
        public string? Profession { get; set; }
    }

    public class ChangePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; } = string.Empty;

        [Required]
        [Compare("NewPassword")]
        public string ConfirmNewPassword { get; set; } = string.Empty;
    }

    public class ForgotPasswordDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Token { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; } = string.Empty;

        [Required]
        [Compare("NewPassword")]
        public string ConfirmNewPassword { get; set; } = string.Empty;
    }

    public class UpdateProfileDto
    {
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string MiddleName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Phone]
        public string? PhoneNumber { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        [MaxLength(50)]
        public string? City { get; set; }

        [MaxLength(50)]
        public string? Country { get; set; }

        [MaxLength(20)]
        public string? PostalCode { get; set; }

        [MaxLength(100)]
        public string? CompanyName { get; set; }

        [MaxLength(1000)]
        public string? Bio { get; set; }

        public DateTime? DateOfBirth { get; set; }

        // Optional merchant banking info
        [MaxLength(34)]
        public string? Iban { get; set; }
    }

    public class TokenValidationDto
    {
        public bool IsValid { get; set; }
        public string? UserId { get; set; }
        public List<string> Roles { get; set; } = new List<string>();
        public string Message { get; set; } = string.Empty;
    }

    public class UpdateIbanDto
    {
        [MaxLength(34)]
        public string? Iban { get; set; }
    }
}

