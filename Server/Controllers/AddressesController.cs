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
    public class AddressesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;
        public AddressesController(ApplicationDbContext db, UserManager<ApplicationUser> userManager)
        {
            _db = db; _userManager = userManager;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Address>>> Get()
        {
            var userId = _userManager.GetUserId(User)!;
            var list = await _db.Addresses.Where(a => a.UserId == userId).OrderByDescending(a => a.IsDefault).ThenByDescending(a => a.Id).ToListAsync();
            return Ok(list);
        }

        public class AddressInput
        {
            public string Name { get; set; } = string.Empty;
            public string FullAddress { get; set; } = string.Empty;
            public string Phone { get; set; } = string.Empty;
        }

        [HttpPost]
        public async Task<ActionResult<Address>> Create([FromBody] AddressInput input)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            var userId = _userManager.GetUserId(User)!;
            var addr = new Address
            {
                UserId = userId,
                Name = input.Name,
                FullAddress = input.FullAddress,
                Phone = input.Phone,
                IsDefault = !await _db.Addresses.AnyAsync(a => a.UserId == userId)
            };
            _db.Addresses.Add(addr);
            await _db.SaveChangesAsync();
            return Ok(addr);
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<Address>> Update(int id, [FromBody] AddressInput input)
        {
            var userId = _userManager.GetUserId(User)!;
            var addr = await _db.Addresses.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
            if (addr == null) return NotFound();
            addr.Name = input.Name;
            addr.FullAddress = input.FullAddress;
            addr.Phone = input.Phone;
            await _db.SaveChangesAsync();
            return Ok(addr);
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> Delete(int id)
        {
            var userId = _userManager.GetUserId(User)!;
            var addr = await _db.Addresses.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
            if (addr == null) return NotFound();
            _db.Addresses.Remove(addr);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("{id:int}/make-default")]
        public async Task<ActionResult> MakeDefault(int id)
        {
            var userId = _userManager.GetUserId(User)!;
            var addr = await _db.Addresses.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
            if (addr == null) return NotFound();
            // unset all
            var all = await _db.Addresses.Where(a => a.UserId == userId).ToListAsync();
            foreach (var a in all) a.IsDefault = false;
            addr.IsDefault = true;
            await _db.SaveChangesAsync();
            return Ok();
        }
    }
}
