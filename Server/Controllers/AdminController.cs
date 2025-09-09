using ConstructionMarketplace.Configuration;
using ConstructionMarketplace.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConstructionMarketplace.Models;
using ConstructionMarketplace.Repositories;

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
    }
}
