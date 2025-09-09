using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Concurrent;

namespace ConstructionMarketplace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CartController : ControllerBase
    {
        private static readonly ConcurrentDictionary<string, List<CartItem>> Store = new();

        private string GetUserId()
        {
            return User?.FindFirst("sub")?.Value
                ?? User?.FindFirst("id")?.Value
                ?? User?.Identity?.Name
                ?? "anonymous";
        }

        private static CartDto ToDto(IEnumerable<CartItem> items)
        {
            var list = items.ToList();
            return new CartDto
            {
                Items = list.Select(i => new CartItemDto
                {
                    Id = i.Id,
                    Name = i.Name,
                    Price = i.Price,
                    Brand = i.Brand,
                    Image = i.Image,
                    Quantity = i.Quantity,
                }).ToList(),
                Total = list.Sum(i => (i.Price ?? 0m) * i.Quantity)
            };
        }

        [HttpGet]
        public ActionResult<CartDto> Get()
        {
            var uid = GetUserId();
            var list = Store.GetOrAdd(uid, _ => new List<CartItem>());
            return Ok(ToDto(list));
        }

        public class AddItemDto { public string Id { get; set; } = string.Empty; public int Quantity { get; set; } public decimal? Price { get; set; } }
        [HttpPost("items")]
        public ActionResult<CartDto> AddItem([FromBody] AddItemDto body)
        {
            if (body == null || string.IsNullOrWhiteSpace(body.Id) || body.Quantity <= 0)
                return BadRequest();
            var uid = GetUserId();
            var list = Store.GetOrAdd(uid, _ => new List<CartItem>());
            var existing = list.FirstOrDefault(x => string.Equals(x.Id, body.Id, StringComparison.OrdinalIgnoreCase));
            if (existing != null)
            {
                existing.Quantity += body.Quantity;
                if (body.Price.HasValue) existing.Price = body.Price;
            }
            else
            {
                list.Add(new CartItem { Id = body.Id, Quantity = body.Quantity, Price = body.Price });
            }
            return Ok(ToDto(list));
        }

        public class UpdateQtyDto { public int Quantity { get; set; } }
        [HttpPatch("items/{id}")]
        public ActionResult<CartDto> UpdateQuantity(string id, [FromBody] UpdateQtyDto body)
        {
            if (string.IsNullOrWhiteSpace(id) || body == null || body.Quantity <= 0)
                return BadRequest();
            var uid = GetUserId();
            var list = Store.GetOrAdd(uid, _ => new List<CartItem>());
            var existing = list.FirstOrDefault(x => string.Equals(x.Id, id, StringComparison.OrdinalIgnoreCase));
            if (existing == null) return NotFound();
            existing.Quantity = body.Quantity;
            return Ok(ToDto(list));
        }

        [HttpDelete("items/{id}")]
        public ActionResult<CartDto> Remove(string id)
        {
            if (string.IsNullOrWhiteSpace(id)) return BadRequest();
            var uid = GetUserId();
            var list = Store.GetOrAdd(uid, _ => new List<CartItem>());
            list.RemoveAll(x => string.Equals(x.Id, id, StringComparison.OrdinalIgnoreCase));
            return Ok(ToDto(list));
        }

        [HttpDelete]
        public ActionResult<CartDto> Clear()
        {
            var uid = GetUserId();
            Store[uid] = new List<CartItem>();
            return Ok(ToDto(Store[uid]));
        }

        public class CartDto { public List<CartItemDto> Items { get; set; } = new(); public decimal Total { get; set; } }
        public class CartItemDto { public string Id { get; set; } = string.Empty; public string? Name { get; set; } public decimal? Price { get; set; } public string? Brand { get; set; } public string? Image { get; set; } public int Quantity { get; set; } }
        public class CartItem { public string Id { get; set; } = string.Empty; public string? Name { get; set; } public decimal? Price { get; set; } public string? Brand { get; set; } public string? Image { get; set; } public int Quantity { get; set; } }
    }
}
