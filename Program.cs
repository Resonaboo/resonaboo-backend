using Audityboo.Models;
using Scalar.AspNetCore;

var serviceModuleType = typeof(ServiceModule);
var serviceTypes = typeof(Program).Assembly
    .GetTypes()
    .Where(type =>
        type is { IsClass: true, IsAbstract: false } &&
        serviceModuleType.IsAssignableFrom(type));

var middlewareServiceModuleType = typeof(MiddlewareModule);
var middlewareTypes = typeof(Program).Assembly
    .GetTypes()
    .Where(type =>
        type is { IsClass: true, IsAbstract: false } &&
        type != middlewareServiceModuleType &&
        middlewareServiceModuleType.IsAssignableFrom(type) &&
        (
            type.GetMethod("Invoke") is not null ||
            type.GetMethod("InvokeAsync") is not null
        ));

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();
foreach (var moduleType in serviceTypes)
{
    builder.Services.AddSingleton(moduleType);
}

var app = builder.Build();
foreach (var moduleType in middlewareTypes)
{
    app.UseMiddleware(moduleType);
}

app.UseDeveloperExceptionPage();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "OpenAPI V1");
    });

    app.UseReDoc(options =>
    {
        options.SpecUrl("/openapi/v1.json");
    });

    app.MapScalarApiReference();
}

app.UseAuthorization();

app.MapControllers();

await app.RunAsync();