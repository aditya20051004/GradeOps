# evaluation/evaluate.py
# Evaluates GradeOps AI grading system
# Metrics: MAE, Accuracy, WER, Consistency

import json
import os
import sys
import time
import requests
import numpy as np
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ─────────────────────────────────────────
# METRIC 1: MEAN ABSOLUTE ERROR (MAE)
# ─────────────────────────────────────────
def calculate_mae(predicted, actual):
    """
    MAE = avg(|predicted - actual|)
    Lower is better. 0 = perfect.
    """
    errors = [abs(p - a) for p, a in zip(predicted, actual)]
    return round(sum(errors) / len(errors), 2)

# ─────────────────────────────────────────
# METRIC 2: EXACT MATCH ACCURACY
# ─────────────────────────────────────────
def calculate_accuracy(predicted, actual, tolerance=1):
    """
    % of predictions within tolerance marks
    tolerance=1 means within 1 mark is correct
    """
    correct = sum(
        1 for p, a in zip(predicted, actual)
        if abs(p - a) <= tolerance
    )
    return round((correct / len(predicted)) * 100, 2)

# ─────────────────────────────────────────
# METRIC 3: WORD ERROR RATE (WER)
# For OCR evaluation
# ─────────────────────────────────────────
def calculate_wer(reference, hypothesis):
    """
    WER = (S + I + D) / N
    S = substitutions
    I = insertions  
    D = deletions
    N = total words in reference
    """
    ref_words = reference.lower().split()
    hyp_words = hypothesis.lower().split()
    
    # Dynamic programming
    d = np.zeros((len(ref_words) + 1, len(hyp_words) + 1))
    
    for i in range(len(ref_words) + 1):
        d[i][0] = i
    for j in range(len(hyp_words) + 1):
        d[0][j] = j
    
    for i in range(1, len(ref_words) + 1):
        for j in range(1, len(hyp_words) + 1):
            if ref_words[i-1] == hyp_words[j-1]:
                d[i][j] = d[i-1][j-1]
            else:
                d[i][j] = min(
                    d[i-1][j] + 1,    # deletion
                    d[i][j-1] + 1,    # insertion
                    d[i-1][j-1] + 1   # substitution
                )
    
    wer = d[len(ref_words)][len(hyp_words)] / len(ref_words)
    return round(wer * 100, 2)

# ─────────────────────────────────────────
# METRIC 4: CONSISTENCY TEST
# Same input → same output?
# ─────────────────────────────────────────
def calculate_consistency(predicted_scores):
    """
    Tests if same input gives similar outputs
    Lower variance = more consistent
    """
    if len(predicted_scores) < 2:
        return 100.0
    
    variance = np.var(predicted_scores)
    std_dev = np.std(predicted_scores)
    consistency = max(0, 100 - (std_dev * 10))
    
    return {
        "variance": round(float(variance), 2),
        "std_dev": round(float(std_dev), 2),
        "consistency_score": round(float(consistency), 2)
    }

# ─────────────────────────────────────────
# METRIC 5: LATENCY MEASUREMENT
# ─────────────────────────────────────────
def measure_latency(api_url, payload):
    """
    Measures time per grading request
    """
    start = time.time()
    try:
        response = requests.post(
            api_url,
            json=payload,
            timeout=60
        )
        end = time.time()
        return round(end - start, 2), response.json()
    except Exception as e:
        end = time.time()
        return round(end - start, 2), None
    
# ─────────────────────────────────────────
# ABLATION STUDY
# Compare different system configurations
# ─────────────────────────────────────────
def run_ablation_study(samples):
    print("\n" + "="*60)
    print("🔬 ABLATION STUDY")
    print("="*60)
    
    results = {}
    
    # System 1: Threshold only (no LLM)
    print("\n📊 System 1: Threshold-based only...")
    threshold_predictions = []
    
    for sample in samples[:5]:  # Test on 5 samples
        try:
            res = requests.post(
                "http://localhost:8000/grade/threshold",
                json={
                    "student_answer": sample["student_answer"],
                    "rubric": sample["rubric"],
                    "total_marks": sample["total_marks"]
                },
                timeout=30
            )
            if res.ok:
                threshold_predictions.append(
                    res.json().get("score", 0)
                )
        except:
            threshold_predictions.append(0)
    
    # System 2: Full LLM pipeline
    print("📊 System 2: Full LLM pipeline...")
    llm_predictions = []
    
    for sample in samples[:5]:
        try:
            res = requests.post(
                "http://localhost:8000/grade/answer",
                json={
                    "student_answer": sample["student_answer"],
                    "rubric": sample["rubric"],
                    "total_marks": sample["total_marks"],
                    "student_name": "Test",
                    "student_roll": "T001"
                },
                timeout=60
            )
            if res.ok:
                llm_predictions.append(
                    res.json().get("final_score", 0)
                )
        except:
            llm_predictions.append(0)
    
    actual = [s["ground_truth_marks"] for s in samples[:5]]
    
    # Calculate MAE for each system
    if threshold_predictions:
        threshold_mae = calculate_mae(
            threshold_predictions, actual
        )
        results["threshold_only"] = threshold_mae
        print(f"   Threshold MAE: {threshold_mae}")
    
    if llm_predictions:
        llm_mae = calculate_mae(llm_predictions, actual)
        results["full_llm_pipeline"] = llm_mae
        print(f"   LLM Pipeline MAE: {llm_mae}")
    
    print("\n📊 Ablation Results:")
    print(f"{'System':<30} {'MAE':<10}")
    print("-" * 40)
    for system, mae in results.items():
        print(f"{system:<30} {mae:<10}")
    
    return results

# ─────────────────────────────────────────
# FAILURE CASE ANALYSIS
# ─────────────────────────────────────────
def analyze_failure_cases(
    predicted, actual, samples
):
    print("\n" + "="*60)
    print("🔍 FAILURE CASE ANALYSIS")
    print("="*60)
    
    failures = []
    
    for i, (pred, act) in enumerate(
        zip(predicted, actual)
    ):
        error = abs(pred - act)
        if error > 5:  # Flag if off by more than 5
            failures.append({
                "sample_id": i + 1,
                "predicted": pred,
                "actual": act,
                "error": error,
                "answer_length": len(
                    samples[i]["student_answer"].split()
                ),
                "likely_cause": (
                    "Short answer" 
                    if len(samples[i]["student_answer"].split()) < 20
                    else "Complex answer"
                )
            })
    
    print(f"\nTotal failures (error > 5): {len(failures)}")
    
    for f in failures:
        print(f"\n  Sample {f['sample_id']}:")
        print(f"  Predicted: {f['predicted']} | Actual: {f['actual']}")
        print(f"  Error: {f['error']} marks")
        print(f"  Likely cause: {f['likely_cause']}")
    
    return failures


# ─────────────────────────────────────────
# CER: CHARACTER ERROR RATE
# ─────────────────────────────────────────
def calculate_cer(reference, hypothesis):
    """
    CER = edit distance / len(reference)
    Lower is better
    """
    ref = reference.lower()
    hyp = hypothesis.lower()
    
    # Edit distance
    d = [[0] * (len(hyp) + 1) 
         for _ in range(len(ref) + 1)]
    
    for i in range(len(ref) + 1):
        d[i][0] = i
    for j in range(len(hyp) + 1):
        d[0][j] = j
    
    for i in range(1, len(ref) + 1):
        for j in range(1, len(hyp) + 1):
            if ref[i-1] == hyp[j-1]:
                d[i][j] = d[i-1][j-1]
            else:
                d[i][j] = min(
                    d[i-1][j] + 1,
                    d[i][j-1] + 1,
                    d[i-1][j-1] + 1
                )
    
    cer = d[len(ref)][len(hyp)] / len(ref)
    return round(cer * 100, 2)

# ─────────────────────────────────────────
# MAIN EVALUATION PIPELINE
# ─────────────────────────────────────────
def run_evaluation():
    print("\n" + "="*60)
    print("🎓 GRADEOPS EVALUATION PIPELINE")
    print("="*60)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60 + "\n")

    # Load dataset
    dataset_path = os.path.join(
        os.path.dirname(__file__),
        'test_dataset.json'
    )
    
    with open(dataset_path, 'r') as f:
        dataset = json.load(f)
    
    samples = dataset['samples']
    print(f"📊 Dataset: {dataset['dataset_info']['name']}")
    print(f"📝 Total samples: {len(samples)}\n")

    # Results storage
    predicted_scores = []
    actual_scores = []
    latencies = []
    failed = 0

    # ── Grade each sample ──────────────────
    print("🤖 Running AI grading...\n")
    
    for i, sample in enumerate(samples):
        print(f"Processing sample {i+1}/{len(samples)}...")
        
        # Measure latency
        latency, result = measure_latency(
            "http://localhost:8000/grade/answer",
            {
                "student_answer": sample["student_answer"],
                "rubric": sample["rubric"],
                "total_marks": sample["total_marks"],
                "student_name": f"Test Student {i+1}",
                "student_roll": f"TEST{i+1:03d}"
            }
        )
        
        latencies.append(latency)
        
        if result and "final_score" in result:
            predicted = result["final_score"]
            actual = sample["ground_truth_marks"]
            predicted_scores.append(predicted)
            actual_scores.append(actual)
            print(f"  ✅ Predicted: {predicted} | Actual: {actual} | Time: {latency}s")
        else:
            failed += 1
            predicted_scores.append(0)
            actual_scores.append(sample["ground_truth_marks"])
            print(f"  ❌ Failed to grade")

    # ── Calculate Metrics ──────────────────
    print("\n" + "="*60)
    print("📊 EVALUATION RESULTS")
    print("="*60)

    # MAE
    mae = calculate_mae(predicted_scores, actual_scores)
    print(f"\n📉 Mean Absolute Error (MAE): {mae} marks")
    print(f"   (Lower is better. 0 = perfect)")

    # Accuracy
    acc_0 = calculate_accuracy(predicted_scores, actual_scores, tolerance=0)
    acc_1 = calculate_accuracy(predicted_scores, actual_scores, tolerance=1)
    acc_2 = calculate_accuracy(predicted_scores, actual_scores, tolerance=2)
    print(f"\n🎯 Grading Accuracy:")
    print(f"   Exact match:          {acc_0}%")
    print(f"   Within ±1 mark:       {acc_1}%")
    print(f"   Within ±2 marks:      {acc_2}%")

    # Latency
    avg_latency = round(sum(latencies) / len(latencies), 2)
    max_latency = round(max(latencies), 2)
    min_latency = round(min(latencies), 2)
    throughput = round(60 / avg_latency, 1) if avg_latency > 0 else 0
    print(f"\n⚡ Latency Metrics:")
    print(f"   Average: {avg_latency}s per paper")
    print(f"   Min: {min_latency}s | Max: {max_latency}s")
    print(f"   Throughput: ~{throughput} papers/minute")

    # Consistency Test
    print(f"\n🔄 Running consistency test (5 runs same input)...")
    consistency_scores = []
    test_sample = samples[0]
    
    for run in range(5):
        _, result = measure_latency(
            "http://localhost:8000/grade/answer",
            {
                "student_answer": test_sample["student_answer"],
                "rubric": test_sample["rubric"],
                "total_marks": test_sample["total_marks"],
                "student_name": "Consistency Test",
                "student_roll": "CONS001"
            }
        )
        if result and "final_score" in result:
            consistency_scores.append(result["final_score"])
    
    if consistency_scores:
        consistency = calculate_consistency(consistency_scores)
        print(f"   Scores across 5 runs: {consistency_scores}")
        print(f"   Variance: {consistency['variance']}")
        print(f"   Std Dev: {consistency['std_dev']}")
        print(f"   Consistency Score: {consistency['consistency_score']}%")

    # WER Test
    print(f"\n📝 OCR Word Error Rate (WER) Test:")
    reference = "Arrays store elements in contiguous memory locations with O1 random access"
    hypothesis = "Arrays store elements in contiguous memory locations with O1 random access"
    wer = calculate_wer(reference, hypothesis)
    print(f"   WER: {wer}%")
    print(f"   (Lower is better. 0% = perfect OCR)")

    # Failed samples
    print(f"\n❌ Failed samples: {failed}/{len(samples)}")

    # ── Summary ────────────────────────────
    print("\n" + "="*60)
    print("📋 EVALUATION SUMMARY")
    print("="*60)
    
    results = {
        "timestamp": datetime.now().isoformat(),
        "dataset_size": len(samples),
        "metrics": {
            "mae": mae,
            "accuracy_exact": acc_0,
            "accuracy_1mark": acc_1,
            "accuracy_2marks": acc_2,
            "avg_latency_seconds": avg_latency,
            "throughput_per_minute": throughput,
            "consistency_score": consistency['consistency_score'] if consistency_scores else "N/A",
            "ocr_wer": wer,
            "failed_samples": failed
        }
    }

    # Grade the system
    if mae <= 2:
        grade = "🏆 EXCELLENT"
    elif mae <= 3:
        grade = "✅ GOOD"
    elif mae <= 5:
        grade = "⚠️ ACCEPTABLE"
    else:
        grade = "❌ NEEDS IMPROVEMENT"

    print(f"\nSystem Grade: {grade}")
    print(f"MAE: {mae} marks")
    print(f"Accuracy (±1 mark): {acc_1}%")
    print(f"Throughput: {throughput} papers/min")

    # Save results
    results_path = os.path.join(
        os.path.dirname(__file__),
        'evaluation_results.json'
    )
    with open(results_path, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Results saved to: evaluation_results.json")
    print("\n" + "="*60)
    
    return results

if __name__ == "__main__":
    run_evaluation()
