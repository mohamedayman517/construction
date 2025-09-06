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
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;
        public OrdersController(ApplicationDbContext db, UserManager<ApplicationUser> userManager)
        {
            _db = db; _userManager = userManager;
        }

        // GET /api/Orders/my
        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<object>>> My()
        {
            var userId = _userManager.GetUserId(User)!;
            // Return lightweight projection for UI
            var orders = await _db.Orders
                .Where(o => o.CustomerId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new
                {
                    o.Id,
                    o.OrderNumber,
                    o.Status,
                    o.CreatedAt,
                    o.TotalAmount,
                    Items = o.Items.Select(i => new { i.ProductId, i.Quantity, i.UnitPrice })
                })
                .ToListAsync();
            return Ok(orders);
        }

        // POST /api/Orders/{id}/cancel
        [HttpPost("{id:int}/cancel")]
        public async Task<ActionResult> Cancel(int id)
        {
            var userId = _userManager.GetUserId(User)!;
            var order = await _db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id && o.CustomerId == userId);
            if (order == null) return NotFound();
            if (order.Status == OrderStatus.Delivered) return BadRequest(new { message = "Cannot cancel delivered order" });
            if (order.Status == OrderStatus.Processing || order.Status == OrderStatus.Shipped || order.Status == OrderStatus.Confirmed || order.Status == OrderStatus.Pending)
            {
                order.Status = OrderStatus.Cancelled;
                await _db.SaveChangesAsync();
                return Ok();
            }
            return BadRequest(new { message = "Invalid state" });
        }

        // POST /api/Orders/{id}/confirm-delivered
        [HttpPost("{id:int}/confirm-delivered")]
        public async Task<ActionResult> ConfirmDelivered(int id)
        {
            var userId = _userManager.GetUserId(User)!;
            var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id && o.CustomerId == userId);
            if (order == null) return NotFound();
            if (order.Status == OrderStatus.Delivered) return Ok();
            order.Status = OrderStatus.Delivered;
            await _db.SaveChangesAsync();
            return Ok();
        }
    }
}
