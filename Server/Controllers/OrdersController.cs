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

        // GET /api/Orders?vendorId=me|{id}
        // List orders that include products belonging to a specific vendor (merchant)
        [HttpGet]
        [Authorize(Roles = "Merchant")]
        public async Task<ActionResult<IEnumerable<object>>> ListForVendor([FromQuery] string? vendorId)
        {
            var uid = _userManager.GetUserId(User)!;
            var targetVendorId = string.Equals(vendorId, "me", StringComparison.OrdinalIgnoreCase) || string.IsNullOrEmpty(vendorId)
                ? uid
                : vendorId!;

            // Orders that contain at least one item of this vendor
            var orders = await _db.Orders
                .Include(o => o.Items)
                    .ThenInclude(oi => oi.Product)
                .Where(o => o.Items.Any(i => i.Product != null && i.Product.MerchantId == targetVendorId))
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new
                {
                    id = o.Id,
                    customerName = o.Customer != null ? (o.Customer.FirstName + " " + o.Customer.LastName) : null,
                    customerEmail = o.Customer != null ? o.Customer.Email : null,
                    createdAt = o.CreatedAt,
                    status = o.Status.ToString(),
                    total = o.TotalAmount,
                    items = o.Items
                        .Where(i => i.Product != null && i.Product.MerchantId == targetVendorId)
                        .Select(i => new { name = i.Product!.NameEn ?? i.Product!.NameAr ?? i.Product!.NameEn, quantity = i.Quantity, price = i.UnitPrice })
                        .ToList()
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

        // PATCH /api/Orders/{id}/status
        // Allow a vendor to update status for orders that include their products
        [HttpPatch("{id:int}/status")]
        [Authorize(Roles = "Merchant")]
        public async Task<ActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto payload)
        {
            if (payload == null || string.IsNullOrWhiteSpace(payload.Status))
                return BadRequest(new { message = "Invalid status" });

            var uid = _userManager.GetUserId(User)!;
            var order = await _db.Orders
                .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(o => o.Id == id);
            if (order == null) return NotFound();

            // Ensure the order contains at least one item that belongs to this vendor
            var hasOwnership = order.Items.Any(i => i.Product != null && i.Product.MerchantId == uid);
            if (!hasOwnership) return Forbid();

            if (!Enum.TryParse<OrderStatus>(payload.Status, ignoreCase: true, out var newStatus))
                return BadRequest(new { message = "Unknown status" });

            order.Status = newStatus;
            await _db.SaveChangesAsync();
            return Ok(new { success = true });
        }
    }

    public class UpdateStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}
