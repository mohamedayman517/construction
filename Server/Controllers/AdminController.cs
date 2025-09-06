using ConstructionMarketplace.Configuration;
using ConstructionMarketplace.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConstructionMarketplace.Models;

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

        public AdminController(
            UserManager<ApplicationUser> userManager,
            IEmailService emailService,
            IConfiguration config,
            ILogger<AdminController> logger)
        {
            _userManager = userManager;
            _emailService = emailService;
            _config = config;
            _logger = logger;
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
    }
}
