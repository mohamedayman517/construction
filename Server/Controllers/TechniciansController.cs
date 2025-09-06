using ConstructionMarketplace.Data;
using ConstructionMarketplace.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConstructionMarketplace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TechniciansController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;
        public TechniciansController(ApplicationDbContext db, UserManager<ApplicationUser> userManager)
        {
            _db = db; _userManager = userManager;
        }

        [HttpGet("{id}/offers")]
        public async Task<ActionResult<IEnumerable<Offer>>> GetOffers(string id)
        {
            // Only allow current user to read his offers unless admin
            var currentUserId = _userManager.GetUserId(User)!;
            var isAdmin = User.IsInRole("Admin");
            if (!isAdmin && id != currentUserId) return Forbid();
            var list = await _db.Offers.Where(o => o.TechnicianId == id).OrderByDescending(o => o.CreatedAt).ToListAsync();
            return Ok(list);
        }
    }
}
