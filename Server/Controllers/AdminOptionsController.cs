using ConstructionMarketplace.Data;
using ConstructionMarketplace.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace ConstructionMarketplace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminOptionsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly ILogger<AdminOptionsController> _logger;

        public AdminOptionsController(ApplicationDbContext db, ILogger<AdminOptionsController> logger)
        {
            _db = db;
            _logger = logger;
        }

        // GET: /api/AdminOptions/{key}
        [HttpGet("{key}")]
        public async Task<IActionResult> GetByKey(string key)
        {
            try
            {
                var k = (key ?? string.Empty).Trim().ToLowerInvariant();
                var opt = await _db.AdminSettings.FirstOrDefaultAsync(o => o.Key == k);
                if (opt == null)
                {
                    return Ok(new { key = k, value = "[]" });
                }
                return Ok(new { key = opt.Key, value = opt.JsonValue });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting admin option {Key}", key);
                return StatusCode(500, new { success = false, message = "Failed to get admin option." });
            }
        }

        // PUT: /api/AdminOptions/{key}
        [HttpPut("{key}")]
        public async Task<IActionResult> Put(string key, [FromBody] JsonElement value)
        {
            try
            {
                var k = (key ?? string.Empty).Trim().ToLowerInvariant();
                var json = value.GetRawText();
                var opt = await _db.AdminSettings.FirstOrDefaultAsync(o => o.Key == k);
                if (opt == null)
                {
                    opt = new AdminSettingEntry { Key = k, JsonValue = json, UpdatedAt = DateTime.UtcNow };
                    _db.AdminSettings.Add(opt);
                }
                else
                {
                    opt.JsonValue = json;
                    opt.UpdatedAt = DateTime.UtcNow;
                    _db.AdminSettings.Update(opt);
                }
                await _db.SaveChangesAsync();
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving admin option {Key}", key);
                return StatusCode(500, new { success = false, message = "Failed to save admin option." });
            }
        }
    }
}
