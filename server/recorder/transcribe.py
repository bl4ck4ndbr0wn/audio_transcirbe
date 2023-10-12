import os

import whisper
from asgiref.sync import sync_to_async
from django.core.files.storage import default_storage
from pydub import AudioSegment

from .models import File
from .serializers import FileSerializer

model = whisper.load_model("base")

class Transcribe:
    @sync_to_async
    def transcribe_file(self, file_id):
        file = File.objects.filter(id=file_id).first()
        if (not file):
            return None
        transcription = model.transcribe(file)
        file.transcript = transcription['text'].strip()
        file.save()
        data = FileSerializer(file).data
        return data
