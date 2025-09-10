using ConstructionMarketplace.Configuration;
using ConstructionMarketplace.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConstructionMarketplace.Models;
using ConstructionMarketplace.Repositories;
using System.Text.Json.Serialization;

namespace ConstructionMarketplace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IEmailService _emailService;
        private readonly ILogger<AdminController> _logger;
        private readonly IConfiguration _config;
        private readonly IProductService _productService;
        private readonly IServiceRequestRepository _serviceRepo;

        public AdminController(
            UserManager<ApplicationUser> userManager,
            IEmailService emailService,
            IConfiguration config,
            ILogger<AdminController> logger,
            IProductService productService,
            IServiceRequestRepository serviceRepo)
        {
            _userManager = userManager;
            _emailService = emailService;
            _config = config;
            _logger = logger;
            _productService = productService;
            _serviceRepo = serviceRepo;
        }

        // List pending services awaiting approval
        [HttpGet("services/pending")]
        public async Task<IActionResult> GetPendingServices()
        {
            try
            {
                var items = await _serviceRepo.FindAsync(sr => !sr.IsApproved);
                var result = items.Select(sr => new
                {
                    id = sr.Id,
                    title = sr.Title,
                    description = sr.Description,
                    merchantId = sr.MerchantId,
                    payRate = sr.PayRate,
                    currency = sr.Currency,
                    createdAt = sr.CreatedAt
                });
                return Ok(new { success = true, items = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error listing pending services");
                return StatusCode(500, new { success = false, message = "Failed to list pending services." });
            }
        }

        // List merchants awaiting approval
        [HttpGet("merchants/pending")]
        public async Task<IActionResult> GetPendingMerchants()
        {
            var users = await _userManager.Users
                .Where(u => !u.IsVerified)
                .ToListAsync();

            var pendingMerchants = new List<object>();
            foreach (var u in users)
            {
                var roles = await _userManager.GetRolesAsync(u);
                if (roles.Contains("Merchant"))
                {
                    pendingMerchants.Add(new
                    {
                        id = u.Id,
                        email = u.Email,
                        name = $"{u.FirstName} {u.LastName}",
                        companyName = u.CompanyName,
                        createdAt = u.CreatedAt,
                        profilePicture = u.ProfilePicture,
                    });
                }
            }

            return Ok(new { success = true, items = pendingMerchants });
        }

        // Suspend a merchant account (disable login and mark inactive)
        [HttpPost("merchants/{userId}/suspend")]
        public async Task<IActionResult> SuspendMerchant(string userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return NotFound(new { success = false, message = "User not found." });

                var roles = await _userManager.GetRolesAsync(user);
                if (!roles.Contains("Merchant"))
                    return BadRequest(new { success = false, message = "User is not a merchant." });

                user.IsActive = false;
                await _userManager.UpdateAsync(user);

                return Ok(new { success = true, message = "Merchant suspended." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error suspending merchant {UserId}", userId);
                return StatusCode(500, new { success = false, message = "Failed to suspend merchant." });
            }
        }

        // Approve a merchant and notify via email
        [HttpPost("merchants/{userId}/approve")]
        public async Task<IActionResult> ApproveMerchant(string userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return NotFound(new { success = false, message = "User not found." });

                var roles = await _userManager.GetRolesAsync(user);
                if (!roles.Contains("Merchant"))
                    return BadRequest(new { success = false, message = "User is not a merchant." });

                user.IsVerified = true;
                user.VerificationDate = DateTime.UtcNow;
                await _userManager.UpdateAsync(user);

                // Send email notification to merchant
                var siteUrl = _config["Site:Url"] ?? "http://localhost:3000"; // optional setting for frontend url
                var subject = "Your merchant account has been approved";
                var body = $@"<p>Dear {user.FirstName},</p>
<p>Your merchant account on Construction Marketplace has been approved.</p>
<p>You can now log in and start using your account:</p>
<p><a href=""{siteUrl}"">{siteUrl}</a></p>
<p>Best regards,<br/>Construction Marketplace Team</p>";

                await _emailService.SendEmailAsync(user.Email!, subject, body);

                return Ok(new { success = true, message = "Merchant approved and email sent." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving merchant {UserId}", userId);
                return StatusCode(500, new { success = false, message = "Failed to approve merchant." });
            }
        }

        // Approve a product
        [HttpPost("products/{productId}/approve")]
        public async Task<IActionResult> ApproveProduct(int productId)
        {
            try
            {
                var ok = await _productService.ApproveProductAsync(productId);
                if (!ok) return NotFound(new { success = false, message = "Product not found." });
                return Ok(new { success = true, message = "Product approved." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving product {ProductId}", productId);
                return StatusCode(500, new { success = false, message = "Failed to approve product." });
            }
        }

        // Reject a product
        [HttpPost("products/{productId}/reject")]
        public async Task<IActionResult> RejectProduct(int productId, [FromBody] string? reason)
        {
            try
            {
                var ok = await _productService.RejectProductAsync(productId, reason ?? string.Empty);
                if (!ok) return NotFound(new { success = false, message = "Product not found." });
                return Ok(new { success = true, message = "Product rejected." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting product {ProductId}", productId);
                return StatusCode(500, new { success = false, message = "Failed to reject product." });
            }
        }

        // Approve a vendor service (ServiceRequest)
        [HttpPost("services/{serviceId}/approve")]
        public async Task<IActionResult> ApproveService(int serviceId)
        {
            try
            {
                var sr = await _serviceRepo.GetByIdAsync(serviceId);
                if (sr == null) return NotFound(new { success = false, message = "Service not found." });
                sr.IsApproved = true;
                sr.ApprovedAt = DateTime.UtcNow;
                await _serviceRepo.UpdateAsync(sr);
                await _serviceRepo.SaveChangesAsync();
                return Ok(new { success = true, message = "Service approved." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving service {ServiceId}", serviceId);
                return StatusCode(500, new { success = false, message = "Failed to approve service." });
            }
        }

        // Reject a vendor service (ServiceRequest)
        [HttpPost("services/{serviceId}/reject")]
        public async Task<IActionResult> RejectService(int serviceId, [FromBody] string? reason)
        {
            try
            {
                var sr = await _serviceRepo.GetByIdAsync(serviceId);
                if (sr == null) return NotFound(new { success = false, message = "Service not found." });
                sr.IsApproved = false;
                sr.ApprovedAt = null;
                await _serviceRepo.UpdateAsync(sr);
                await _serviceRepo.SaveChangesAsync();
                return Ok(new { success = true, message = "Service rejected." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting service {ServiceId}", serviceId);
                return StatusCode(500, new { success = false, message = "Failed to reject service." });
            }
        }

        // List users with optional filtering by role and status
        // GET: /api/Admin/users?role=Admin|Merchant|Technician|Customer&status=active|inactive|pending
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers([FromQuery] string? role = null, [FromQuery] string? status = null)
        {
            try
            {
                var query = _userManager.Users.AsQueryable();

                // Filter by status (basic mapping)
                if (!string.IsNullOrWhiteSpace(status))
                {
                    var s = status.Trim().ToLowerInvariant();
                    if (s == "active") query = query.Where(u => u.IsActive);
                    else if (s == "inactive" || s == "suspended" || s == "banned") query = query.Where(u => !u.IsActive);
                    else if (s == "pending") query = query.Where(u => !u.IsVerified);
                }

                var list = await query.ToListAsync();
                var results = new List<object>();
                foreach (var u in list)
                {
                    var roles = await _userManager.GetRolesAsync(u);
                    if (!string.IsNullOrWhiteSpace(role))
                    {
                        // Normalize role names
                        var r = role.Trim();
                        if (!roles.Contains(r, StringComparer.OrdinalIgnoreCase))
                            continue;
                    }
                    results.Add(new
                    {
                        id = u.Id,
                        name = $"{u.FirstName} {(string.IsNullOrWhiteSpace(u.MiddleName) ? string.Empty : u.MiddleName + " ")}{u.LastName}".Trim(),
                        email = u.Email,
                        phoneNumber = u.PhoneNumber,
                        roles,
                        isActive = u.IsActive,
                        isVerified = u.IsVerified,
                        createdAt = u.CreatedAt,
                        companyName = u.CompanyName,
                        city = u.City,
                        country = u.Country,
                    });
                }

                return Ok(new { success = true, items = results });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error listing users by admin");
                return StatusCode(500, new { success = false, message = "Failed to list users." });
            }
        }

        // Update user status (activate/suspend). For now toggle IsActive
        [HttpPost("users/{userId}/status")]
        public async Task<IActionResult> UpdateUserStatus(string userId, [FromBody] UpdateUserStatusDto payload)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return NotFound(new { success = false, message = "User not found." });

                var desired = (payload?.Status ?? string.Empty).Trim().ToLowerInvariant();
                if (desired == "active") user.IsActive = true;
                else if (desired == "suspended" || desired == "banned" || desired == "inactive") user.IsActive = false;
                else if (desired == "pending") user.IsVerified = false; // best-effort mapping
                else return BadRequest(new { success = false, message = "Unknown status." });

                await _userManager.UpdateAsync(user);
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user status {UserId}", userId);
                return StatusCode(500, new { success = false, message = "Failed to update user status." });
            }
        }

        // Create a new user with a role
        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] AdminCreateUserDto dto)
        {
            try
            {
                if (dto == null || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                    return BadRequest(new { success = false, message = "Email and Password are required." });

                var existing = await _userManager.FindByEmailAsync(dto.Email);
                if (existing != null)
                    return BadRequest(new { success = false, message = "Email already exists." });

                var user = new ApplicationUser
                {
                    UserName = dto.Email,
                    Email = dto.Email,
                    FirstName = dto.FirstName ?? "",
                    LastName = dto.LastName ?? "",
                    PhoneNumber = dto.PhoneNumber,
                    CompanyName = dto.CompanyName,
                    City = dto.City,
                    Country = dto.Country,
                    IsActive = true,
                    IsVerified = string.Equals(dto.Role, "Merchant", StringComparison.OrdinalIgnoreCase) ? false : true,
                };

                var result = await _userManager.CreateAsync(user, dto.Password);
                if (!result.Succeeded)
                {
                    return BadRequest(new { success = false, message = string.Join("; ", result.Errors.Select(e => e.Description)) });
                }

                if (!string.IsNullOrWhiteSpace(dto.Role))
                {
                    await _userManager.AddToRoleAsync(user, dto.Role);
                }

                return Ok(new { success = true, id = user.Id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user by admin");
                return StatusCode(500, new { success = false, message = "Failed to create user." });
            }
        }

        // Update user basic fields
        [HttpPut("users/{userId}")]
        public async Task<IActionResult> UpdateUser(string userId, [FromBody] AdminUpdateUserDto dto)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return NotFound(new { success = false, message = "User not found." });

                if (!string.IsNullOrWhiteSpace(dto.FirstName)) user.FirstName = dto.FirstName!;
                if (!string.IsNullOrWhiteSpace(dto.MiddleName)) user.MiddleName = dto.MiddleName!;
                if (!string.IsNullOrWhiteSpace(dto.LastName)) user.LastName = dto.LastName!;
                if (!string.IsNullOrWhiteSpace(dto.PhoneNumber)) user.PhoneNumber = dto.PhoneNumber!;
                if (!string.IsNullOrWhiteSpace(dto.CompanyName)) user.CompanyName = dto.CompanyName!;
                if (!string.IsNullOrWhiteSpace(dto.City)) user.City = dto.City!;
                if (!string.IsNullOrWhiteSpace(dto.Country)) user.Country = dto.Country!;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                    return BadRequest(new { success = false, message = string.Join("; ", result.Errors.Select(e => e.Description)) });

                // Optionally update roles
                if (!string.IsNullOrWhiteSpace(dto.Role))
                {
                    var currentRoles = await _userManager.GetRolesAsync(user);
                    if (!currentRoles.Contains(dto.Role))
                    {
                        await _userManager.RemoveFromRolesAsync(user, currentRoles);
                        await _userManager.AddToRoleAsync(user, dto.Role);
                    }
                }

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user by admin {UserId}", userId);
                return StatusCode(500, new { success = false, message = "Failed to update user." });
            }
        }

        // Delete user
        [HttpDelete("users/{userId}")]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return NotFound(new { success = false, message = "User not found." });

                var result = await _userManager.DeleteAsync(user);
                if (!result.Succeeded)
                    return BadRequest(new { success = false, message = string.Join("; ", result.Errors.Select(e => e.Description)) });

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user by admin {UserId}", userId);
                return StatusCode(500, new { success = false, message = "Failed to delete user." });
            }
        }
    }

    public class UpdateUserStatusDto
    {
        [JsonPropertyName("status")] public string Status { get; set; } = string.Empty;
    }

    public class AdminCreateUserDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? MiddleName { get; set; }
        public string? LastName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? CompanyName { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        // Role names: Admin | Merchant | Technician | Customer
        public string? Role { get; set; }
    }

    public class AdminUpdateUserDto
    {
        public string? FirstName { get; set; }
        public string? MiddleName { get; set; }
        public string? LastName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? CompanyName { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        // Optional role update
        public string? Role { get; set; }
    }
}
