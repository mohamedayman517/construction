using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionMarketplace.Models
{
    public enum InvoiceType
    {
        Sale = 0,
        Purchase = 1,
        Service = 2,
        Rental = 3
    }

    public enum InvoiceStatus
    {
        Draft = 0,
        Sent = 1,
        Paid = 2,
        Overdue = 3,
        Cancelled = 4
    }

    public class Invoice
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string InvoiceNumber { get; set; } = string.Empty;

        [Required]
        public string MerchantId { get; set; } = string.Empty;

        public string? CustomerId { get; set; }

        [MaxLength(200)]
        public string? CustomerName { get; set; }

        [MaxLength(500)]
        public string? CustomerAddress { get; set; }

        [MaxLength(50)]
        public string? CustomerPhone { get; set; }

        [MaxLength(100)]
        public string? CustomerEmail { get; set; }

        public InvoiceType Type { get; set; }

        public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;

        [Required]
        public DateTime InvoiceDate { get; set; }

        public DateTime? DueDate { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal SubTotal { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxAmount { get; set; } = 0;

        [Column(TypeName = "decimal(5,2)")]
        public decimal TaxRate { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountAmount { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal ShippingAmount { get; set; } = 0;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal PaidAmount { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal RemainingAmount { get; set; }

        [MaxLength(10)]
        public string Currency { get; set; } = "USD";

        [MaxLength(1000)]
        public string? Notes { get; set; }

        [MaxLength(1000)]
        public string? Terms { get; set; }

        public DateTime? PaidAt { get; set; }

        [MaxLength(100)]
        public string? PaymentMethod { get; set; }

        [MaxLength(100)]
        public string? PaymentReference { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual ApplicationUser Merchant { get; set; } = null!;
        public virtual ApplicationUser? Customer { get; set; }
        public virtual ICollection<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();
        public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }

    public class InvoiceItem
    {
        public int Id { get; set; }

        [Required]
        public int InvoiceId { get; set; }

        public int? ProductId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Quantity { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountAmount { get; set; } = 0;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; }

        [MaxLength(50)]
        public string? Unit { get; set; }

        // Navigation properties
        public virtual Invoice Invoice { get; set; } = null!;
        public virtual Product? Product { get; set; }
    }

    public class Payment
    {
        public int Id { get; set; }

        [Required]
        public int InvoiceId { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [MaxLength(10)]
        public string Currency { get; set; } = "USD";

        [Required]
        public DateTime PaymentDate { get; set; }

        [Required]
        [MaxLength(100)]
        public string PaymentMethod { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Reference { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Invoice Invoice { get; set; } = null!;
    }

    public enum ExpenseCategory
    {
        Materials = 0,
        Labor = 1,
        Equipment = 2,
        Transportation = 3,
        Utilities = 4,
        Marketing = 5,
        Office = 6,
        Insurance = 7,
        Taxes = 8,
        Other = 9
    }

    public class Expense
    {
        public int Id { get; set; }

        [Required]
        public string MerchantId { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [MaxLength(10)]
        public string Currency { get; set; } = "USD";

        [Required]
        public ExpenseCategory Category { get; set; }

        [Required]
        public DateTime ExpenseDate { get; set; }

        [MaxLength(100)]
        public string? Vendor { get; set; }

        [MaxLength(100)]
        public string? PaymentMethod { get; set; }

        [MaxLength(100)]
        public string? Reference { get; set; }

        [MaxLength(500)]
        public string? ReceiptUrl { get; set; }

        public bool IsRecurring { get; set; } = false;

        [MaxLength(50)]
        public string? RecurrencePattern { get; set; }

        public DateTime? NextRecurrenceDate { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual ApplicationUser Merchant { get; set; } = null!;
    }

    public class Salary
    {
        public int Id { get; set; }

        [Required]
        public string MerchantId { get; set; } = string.Empty;

        [Required]
        public string EmployeeId { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string EmployeeName { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal BaseSalary { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Overtime { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Bonus { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Deductions { get; set; } = 0;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal NetSalary { get; set; }

        [MaxLength(10)]
        public string Currency { get; set; } = "USD";

        [Required]
        public DateTime PayPeriodStart { get; set; }

        [Required]
        public DateTime PayPeriodEnd { get; set; }

        [Required]
        public DateTime PayDate { get; set; }

        [MaxLength(100)]
        public string? PaymentMethod { get; set; }

        [MaxLength(100)]
        public string? PaymentReference { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ApplicationUser Merchant { get; set; } = null!;
        public virtual ApplicationUser Employee { get; set; } = null!;
    }

    public class InventoryItem
    {
        public int Id { get; set; }

        [Required]
        public string MerchantId { get; set; } = string.Empty;

        public int? ProductId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [MaxLength(50)]
        public string? SKU { get; set; }

        [MaxLength(50)]
        public string? Barcode { get; set; }

        [Required]
        public int CurrentStock { get; set; }

        public int MinimumStock { get; set; } = 0;

        public int MaximumStock { get; set; } = 0;

        public int ReorderPoint { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal CostPrice { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal SellingPrice { get; set; } = 0;

        [MaxLength(10)]
        public string Currency { get; set; } = "USD";

        [MaxLength(100)]
        public string? Location { get; set; }

        [MaxLength(50)]
        public string? Unit { get; set; }

        public DateTime? LastRestockDate { get; set; }

        public DateTime? ExpiryDate { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual ApplicationUser Merchant { get; set; } = null!;
        public virtual Product? Product { get; set; }
        public virtual ICollection<InventoryMovement> Movements { get; set; } = new List<InventoryMovement>();
    }

    public enum MovementType
    {
        Purchase = 0,
        Sale = 1,
        Return = 2,
        Adjustment = 3,
        Transfer = 4,
        Damage = 5,
        Expired = 6
    }

    public class InventoryMovement
    {
        public int Id { get; set; }

        [Required]
        public int InventoryItemId { get; set; }

        [Required]
        public MovementType Type { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        public int PreviousStock { get; set; }

        [Required]
        public int NewStock { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? UnitCost { get; set; }

        [MaxLength(500)]
        public string? Reference { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual InventoryItem InventoryItem { get; set; } = null!;
    }
}

