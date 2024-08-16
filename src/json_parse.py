import json
from google.cloud import storage

def update_benchmark_data(event, json_content):
    """Cloud Function triggered by a new file in the GCS bucket."""
    bucket_name = event['bucket']
    file_name = event['name']
    
    if not file_name.startswith('benchmark_'):
        return  # Not a benchmark file
    
    client = storage.Client()
    bucket = client.get_bucket(bucket_name)
    
    # Read the new benchmark file
    blob = bucket.blob(file_name)
    benchmark_data = json.loads(blob.download_as_text())
    
    # Read the main data file
    main_blob = bucket.blob('benchmark_data.json')
    if main_blob.exists():
        main_data = json.loads(main_blob.download_as_text())
    else:
        main_data = {'benchmarks': [], 'commits': []}
    
    # Update benchmarks
    commit_hash = file_name.split('_')[1].split('.')[0]
    for benchmark in benchmark_data:
        benchmark['commitHash'] = commit_hash
        main_data['benchmarks'].append(benchmark)
    
    # Update commit history
    commit_blob = bucket.blob(f'commits/commit_{commit_hash}.json')
    if commit_blob.exists():
        commit_info = json.loads(commit_blob.download_as_text())
        main_data['commits'].append({
            'hash': commit_info['hash'],
            'parent': commit_info['parent'],
            'timestamp': commit_info['timestamp']
        })
    
    # Sort commits by timestamp to ensure correct order
    main_data['commits'].sort(key=lambda x: x['timestamp'])
    
    # Write updated data back to GCS
    main_blob.upload_from_string(json.dumps(main_data), content_type='application/json')