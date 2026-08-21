from fastapi import APIRouter, UploadFile, File
from sarvamai import SarvamAI
from dotenv import load_dotenv

import tempfile
import os
import json
import shutil

load_dotenv()

router = APIRouter()

client = SarvamAI(
    api_subscription_key=os.getenv(
        "SARVAM_API_KEY"
    )
)


@router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...)
):

    suffix = os.path.splitext(
        file.filename
    )[1]

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix
    ) as temp_file:

        temp_file.write(
            await file.read()
        )

        temp_path = temp_file.name

    try:

        # Create Speech To Text Job
        job = client.speech_to_text_job.create_job(
            model="saaras:v3",
            mode="transcribe",

            # Force Hindi for testing
            language_code="hi-IN",

            with_diarization=True,
            num_speakers=2
        )

        # Upload Audio
        job.upload_files(
            file_paths=[temp_path]
        )

        # Start Job
        job.start()

        # Wait Until Complete
        job.wait_until_complete()

        # Output Directory
        output_dir = "sarvam_output"

        # Delete old outputs
        if os.path.exists(output_dir):
            shutil.rmtree(output_dir)

        # Create fresh directory
        os.makedirs(
            output_dir,
            exist_ok=True
        )

        # Download latest output
        job.download_outputs(
            output_dir=output_dir
        )

        # Find JSON files
        json_files = [
            f for f in os.listdir(output_dir)
            if f.endswith(".json")
        ]

        if not json_files:
            return {
                "status": "error",
                "message":
                "No transcript file found"
            }

        latest_json = os.path.join(
            output_dir,
            json_files[0]
        )

        # Read transcript file
        with open(
            latest_json,
            "r",
            encoding="utf-8"
        ) as f:

            data = json.load(f)

        transcript = data.get(
            "transcript",
            ""
        )

        language = data.get(
            "language_code",
            ""
        )

        speakers = (
            data.get(
                "diarized_transcript",
                {}
            )
            .get(
                "entries",
                []
            )
        )

        print(
            "\n========== SARVAM OUTPUT =========="
        )

        print(
            "Language:",
            language
        )

        print(
            "Transcript:",
            transcript
        )

        print(
            "===================================\n"
        )

        return {
            "status": "success",
            "transcript":
                transcript,

            "language":
                language,

            "speakers":
                speakers
        }

    except Exception as e:

        print(
            "Sarvam Error:",
            str(e)
        )

        return {
            "status": "error",
            "message": str(e)
        }

    finally:

        if os.path.exists(temp_path):
            os.remove(temp_path)