using CoreWCF;
using CoreWCF.Configuration;
using CoreWCF.Description;
using Microsoft.EntityFrameworkCore;
using soap_vehiculos.Data;
using soap_vehiculos.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<VehiculosDBContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("VehiculosConnection")
    )
);

builder.Services.AddScoped<VehiculoService>();

builder.Services
    .AddServiceModelServices()
    .AddServiceModelMetadata();

builder.Services.AddSingleton<IServiceBehavior,
    UseRequestHeadersForMetadataAddressBehavior>();

builder.Services.AddSingleton<ServiceDebugBehavior>();
builder.Services.Configure<ServiceDebugBehavior>(opts =>
    opts.IncludeExceptionDetailInFaults = builder.Environment.IsDevelopment()
);

builder.WebHost.ConfigureKestrel(options =>
{
    options.AllowSynchronousIO = true;
});

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
        ctx.Context.Response.Headers["Cache-Control"] = "no-cache"
});

app.UseServiceModel(serviceBuilder =>
{
    serviceBuilder
        .AddService<VehiculoService>()
        .AddServiceEndpoint<VehiculoService, IVehiculoService>(
            new BasicHttpBinding(),
            "/VehiculoService.svc"
        );
});

var metadataBehavior =
    app.Services.GetRequiredService<ServiceMetadataBehavior>();

metadataBehavior.HttpGetEnabled = true;

app.Run();
