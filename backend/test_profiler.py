from app.services.dataset_profiler import DatasetProfiler


file_path = "YOUR_DATASET_PATH_HERE"

profiler = DatasetProfiler(file_path)

result = profiler.profile()

print("\n========== DATASET PROFILE ==========\n")

print("Shape:")
print(result["shape"])

print("\nNumerical columns:")
print(result["numerical_columns"])

print("\nCategorical columns:")
print(result["categorical_columns"])

print("\nMissing values:")
print(result["missing_values"])

print("\nDuplicate rows:")
print(result["duplicate_rows"])

print("\nStatistics:")
print(result["statistics"])

print("\nTop correlations:")
print(result["correlations"])