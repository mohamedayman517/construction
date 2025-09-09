using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ConstructionMarketplace.Repositories;
using ConstructionMarketplace.Models;

namespace ConstructionMarketplace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServicesController : ControllerBase
    {
        private readonly IServiceRequestRepository _serviceRepo;
        private readonly ILogger<ServicesController> _logger;

        public ServicesController(IServiceRequestRepository serviceRepo, ILogger<ServicesController> logger)
        {
            _serviceRepo = serviceRepo;
            _logger = logger;
        }

        // Public: list approved services (simple view)
        [HttpGet("public")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<object>>> ListPublic()
        {
            try
            {
                var items = await _serviceRepo.FindAsync(sr => sr.IsApproved);
                var dto = items.Select(MapToClientDto);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error listing public services");
                return StatusCode(500, new { success = false, message = "An error occurred while listing services." });
            }
        }

        private static string? GetUserId(ControllerBase c)
        {
            return c.User.FindFirst("sub")?.Value ?? c.User.FindFirst("id")?.Value;
        }

        // List vendor services (own services)
        [HttpGet]
        [Authorize(Roles = "Merchant")]
        public async Task<ActionResult<IEnumerable<object>>> List([FromQuery] string? vendorId)
        {
            try
            {
                var me = GetUserId(this);
                if (string.Equals(vendorId, "me", StringComparison.OrdinalIgnoreCase))
                {
                    if (string.IsNullOrEmpty(me)) return Unauthorized();
                    var mine = await _serviceRepo.GetByMerchantAsync(me);
                    var dto = mine.Select(MapToClientDto);
                    return Ok(dto);
                }
                // For now, only allow vendors to see their own items via this endpoint
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error listing services");
                return StatusCode(500, new { success = false, message = "An error occurred while listing services." });
            }
        }

        // Get single service (owner only)
        [HttpGet("{id}")]
        [Authorize(Roles = "Merchant")]
        public async Task<ActionResult<object>> Get(int id)
        {
            try
            {
                var me = GetUserId(this);
                if (string.IsNullOrEmpty(me)) return Unauthorized();
                var sr = await _serviceRepo.GetByIdAsync(id);
                if (sr == null || sr.MerchantId != me) return NotFound(new { success = false, message = "Service not found." });
                return Ok(MapToClientDto(sr));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting service {ServiceId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while getting the service." });
            }
        }

        // Create a new service (Merchant only) - pending admin approval
        [HttpPost]
        [Authorize(Roles = "Merchant")]
        public async Task<ActionResult<object>> Create([FromBody] ServiceCatalogCreateDto payload)
        {
            try
            {
                if (payload == null || string.IsNullOrWhiteSpace(payload.Type))
                    return BadRequest(new { success = false, message = "Invalid input." });

                var me = GetUserId(this);
                if (string.IsNullOrEmpty(me)) return Unauthorized();

                var (stypeOk, stype) = ParseServiceType(payload.Type);
                if (!stypeOk) return BadRequest(new { success = false, message = "Unknown service type." });

                var now = DateTime.UtcNow;
                var sr = new ServiceRequest
                {
                    Title = payload.Description ?? payload.Type,
                    Description = payload.Description ?? payload.Type,
                    MerchantId = me,
                    ServiceType = stype,
                    PayRate = payload.DailyWage,
                    Currency = "USD",
                    Location = payload.Location ?? "N/A",
                    StartDate = now,
                    EndDate = payload.Days.HasValue && payload.Days.Value > 0 ? now.AddDays(payload.Days.Value) : null,
                    WorkingHours = null,
                    WorkersNeeded = 1,
                    RequiredSkills = null,
                    RequiredExperience = null,
                    RequiredTools = null,
                    ToolsProvided = false,
                    TransportationProvided = false,
                    MealsProvided = false,
                    Status = ServiceRequestStatus.Open,
                    ApplicationDeadline = now.AddDays(7),
                    CreatedAt = now,
                    IsApproved = false
                };

                await _serviceRepo.AddAsync(sr);
                await _serviceRepo.SaveChangesAsync();

                return CreatedAtAction(nameof(Get), new { id = sr.Id }, MapToClientDto(sr));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating service");
                return StatusCode(500, new { success = false, message = "An error occurred while creating the service." });
            }
        }

        // Update service (Merchant only)
        [HttpPut("{id}")]
        [Authorize(Roles = "Merchant")]
        public async Task<ActionResult<object>> Update(int id, [FromBody] ServiceCatalogCreateDto payload)
        {
            try
            {
                var me = GetUserId(this);
                if (string.IsNullOrEmpty(me)) return Unauthorized();
                var sr = await _serviceRepo.GetByIdAsync(id);
                if (sr == null || sr.MerchantId != me) return NotFound(new { success = false, message = "Service not found." });

                if (!string.IsNullOrWhiteSpace(payload.Type))
                {
                    var (stypeOk, stype) = ParseServiceType(payload.Type);
                    if (stypeOk) sr.ServiceType = stype;
                }
                if (payload.DailyWage > 0) sr.PayRate = payload.DailyWage;
                if (payload.Days.HasValue && payload.Days.Value > 0)
                {
                    var now = DateTime.UtcNow;
                    sr.EndDate = now.AddDays(payload.Days.Value);
                }
                if (!string.IsNullOrWhiteSpace(payload.Description))
                {
                    sr.Description = payload.Description!;
                    sr.Title = payload.Description!;
                }
                sr.UpdatedAt = DateTime.UtcNow;

                await _serviceRepo.UpdateAsync(sr);
                await _serviceRepo.SaveChangesAsync();

                return Ok(MapToClientDto(sr));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating service {ServiceId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while updating the service." });
            }
        }

        // Delete service (Merchant only)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Merchant")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var me = GetUserId(this);
                if (string.IsNullOrEmpty(me)) return Unauthorized();
                var sr = await _serviceRepo.GetByIdAsync(id);
                if (sr == null || sr.MerchantId != me) return NotFound(new { success = false, message = "Service not found." });

                await _serviceRepo.DeleteAsync(sr);
                await _serviceRepo.SaveChangesAsync();
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting service {ServiceId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while deleting the service." });
            }
        }

        private static (bool ok, ServiceType value) ParseServiceType(string type)
        {
            if (Enum.TryParse<ServiceType>(type, ignoreCase: true, out var parsed))
                return (true, parsed);
            // Fallback common labels mapping
            var map = new Dictionary<string, ServiceType>(StringComparer.OrdinalIgnoreCase)
            {
                {"plumber", ServiceType.Daily},
                {"electrician", ServiceType.Daily},
                {"carpenter", ServiceType.Daily},
                {"painter", ServiceType.Daily},
                {"gypsum_installer", ServiceType.Project},
                {"marble_installer", ServiceType.Project},
                {"daily", ServiceType.Daily},
                {"hourly", ServiceType.Hourly},
                {"project", ServiceType.Project},
            };
            if (map.TryGetValue(type, out var val)) return (true, val);
            return (false, ServiceType.Daily);
        }

        private static object MapToClientDto(ServiceRequest s)
        {
            // Compute days for client display if dates exist
            int? days = null;
            if (s.StartDate != default && s.EndDate.HasValue)
            {
                days = (int)Math.Max(0, (s.EndDate.Value.Date - s.StartDate.Date).TotalDays);
            }
            return new
            {
                id = s.Id,
                type = s.ServiceType.ToString(),
                dailyWage = s.PayRate,
                days = days,
                total = days.HasValue ? (decimal)days.Value * s.PayRate : (decimal?)null,
                description = s.Description,
                createdAt = s.CreatedAt,
                updatedAt = s.UpdatedAt,
                vendorId = s.MerchantId,
                isApproved = s.IsApproved
            };
        }
    }

    public class ServiceCatalogCreateDto
    {
        public string Type { get; set; } = string.Empty;
        public decimal DailyWage { get; set; }
        public int? Days { get; set; }
        public string? Description { get; set; }
        public string? Location { get; set; }
    }
}
