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
    public class OffersController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;
        public OffersController(ApplicationDbContext db, UserManager<ApplicationUser> userManager)
        {
            _db = db; _userManager = userManager;
        }

        public class OfferInput
        {
            public string TargetType { get; set; } = "service"; // service|project
            public int? ServiceId { get; set; }
            public int? ProjectId { get; set; }
            public decimal Price { get; set; }
            public int Days { get; set; }
            public string? Message { get; set; }
        }

        [HttpPost]
        public async Task<ActionResult<Offer>> Create([FromBody] OfferInput input)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            var techId = _userManager.GetUserId(User)!;
            var offer = new Offer
            {
                TechnicianId = techId,
                TargetType = input.TargetType,
                ServiceId = input.ServiceId,
                ProjectId = input.ProjectId,
                Price = input.Price,
                Days = input.Days,
                Message = input.Message,
                Status = "pending"
            };
            _db.Offers.Add(offer);
            await _db.SaveChangesAsync();
            return Ok(offer);
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<Offer>> Update(int id, [FromBody] OfferInput input)
        {
            var techId = _userManager.GetUserId(User)!;
            var offer = await _db.Offers.FirstOrDefaultAsync(o => o.Id == id && o.TechnicianId == techId);
            if (offer == null) return NotFound();
            if (offer.Status != "pending") return BadRequest(new { message = "Only pending offers can be updated" });
            offer.TargetType = input.TargetType;
            offer.ServiceId = input.ServiceId;
            offer.ProjectId = input.ProjectId;
            offer.Price = input.Price;
            offer.Days = input.Days;
            offer.Message = input.Message;
            await _db.SaveChangesAsync();
            return Ok(offer);
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> Delete(int id)
        {
            var techId = _userManager.GetUserId(User)!;
            var offer = await _db.Offers.FirstOrDefaultAsync(o => o.Id == id && o.TechnicianId == techId);
            if (offer == null) return NotFound();
            _db.Offers.Remove(offer);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
