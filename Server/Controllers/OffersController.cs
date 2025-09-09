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

        // List offers for a specific service (Merchant only, must own the service)
        [HttpGet("service/{serviceId:int}")]
        [Authorize(Roles = "Merchant")]
        public async Task<ActionResult<IEnumerable<Offer>>> ListForService(int serviceId)
        {
            var me = _userManager.GetUserId(User)!;
            var service = await _db.ServiceRequests.FirstOrDefaultAsync(s => s.Id == serviceId && s.MerchantId == me);
            if (service == null) return Forbid();
            var list = await _db.Offers.Where(o => o.ServiceId == serviceId).OrderByDescending(o => o.CreatedAt).ToListAsync();
            return Ok(list);
        }

        // List offers for a specific project (Customer only, must own the project)
        [HttpGet("project/{projectId:int}")]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult<IEnumerable<Offer>>> ListForProject(int projectId)
        {
            var me = _userManager.GetUserId(User)!;
            var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == projectId && p.CustomerId == me);
            if (project == null) return Forbid();
            var list = await _db.Offers.Where(o => o.ProjectId == projectId).OrderByDescending(o => o.CreatedAt).ToListAsync();
            return Ok(list);
        }

        public class StatusInput { public string? Status { get; set; } }

        // Update offer status (Merchant if service offer; Customer if project offer)
        [HttpPost("{id:int}/status")]
        [Authorize]
        public async Task<ActionResult<Offer>> UpdateStatus(int id, [FromBody] StatusInput input)
        {
            if (input == null || string.IsNullOrWhiteSpace(input.Status)) return BadRequest(new { message = "Invalid status" });
            var status = input.Status!.ToLowerInvariant();
            if (status != "accepted" && status != "rejected" && status != "pending")
                return BadRequest(new { message = "Unknown status" });

            var userId = _userManager.GetUserId(User)!;
            var offer = await _db.Offers.FirstOrDefaultAsync(o => o.Id == id);
            if (offer == null) return NotFound();

            // Authorization: if tied to a service -> merchant owner; if to a project -> customer owner
            if (offer.ServiceId.HasValue)
            {
                var service = await _db.ServiceRequests.FirstOrDefaultAsync(s => s.Id == offer.ServiceId.Value);
                if (service == null || service.MerchantId != userId) return Forbid();
            }
            else if (offer.ProjectId.HasValue)
            {
                var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == offer.ProjectId.Value);
                if (project == null || project.CustomerId != userId) return Forbid();
            }
            else
            {
                return BadRequest(new { message = "Offer target missing" });
            }

            offer.Status = status;
            await _db.SaveChangesAsync();
            return Ok(offer);
        }
    }
}
