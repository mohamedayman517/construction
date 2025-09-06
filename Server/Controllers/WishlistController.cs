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
    public class WishlistController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;
        public WishlistController(ApplicationDbContext db, UserManager<ApplicationUser> userManager)
        {
            _db = db; _userManager = userManager;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> Get()
        {
            var userId = _userManager.GetUserId(User)!;
            var items = await _db.WishlistItems
                .Where(w => w.UserId == userId)
                .Include(w => w.Product)
                .Select(w => new { w.Id, w.ProductId, ProductName = w.Product!.NameEn, w.CreatedAt })
                .ToListAsync();
            return Ok(items);
        }

        [HttpPost("{productId:int}")]
        public async Task<ActionResult> Add(int productId)
        {
            var userId = _userManager.GetUserId(User)!;
            var exists = await _db.WishlistItems.AnyAsync(w => w.UserId == userId && w.ProductId == productId);
            if (exists) return NoContent();
            var prod = await _db.Products.FindAsync(productId);
            if (prod == null) return NotFound();
            _db.WishlistItems.Add(new WishlistItem { UserId = userId, ProductId = productId });
            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("{productId:int}")]
        public async Task<ActionResult> Remove(int productId)
        {
            var userId = _userManager.GetUserId(User)!;
            var item = await _db.WishlistItems.FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId);
            if (item == null) return NotFound();
            _db.WishlistItems.Remove(item);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
