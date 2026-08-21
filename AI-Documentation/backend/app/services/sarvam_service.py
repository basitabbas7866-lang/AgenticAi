import os
from dotenv import load_dotenv
from sarvamai import SarvamAI

load_dotenv()

client = SarvamAI(
    api_subscription_key=os.getenv(
        "SARVAM_API_KEY"
    )
)


def transcribe_audio(audio_path):

    try:

        job = client.speech_to_text_job.create_job(
            model="saaras:v3",
            mode="transcribe",

            # Force Hindi for testing
           language_code="en-IN",

            with_diarization=True,
            num_speakers=2
        )

        job.upload_files(
            file_paths=[audio_path]
        )

        job.start()

        job.wait_until_complete()

        file_results = (
            job.get_file_results()
        )

        return file_results

    except Exception as e:

        print(
            "Sarvam Error:",
            str(e)
        )

        raise e