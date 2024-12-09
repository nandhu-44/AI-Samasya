from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class DocumentUpload(models.Model):
    """
    Model to store uploaded documents
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_documents')
    file = models.FileField(upload_to='uploaded_documents/')
    filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50)
    uploaded_at = models.DateTimeField(default=timezone.now)
    is_processed = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.filename} - uploaded by {self.user.username}"
    
    class Meta:
        verbose_name = 'Document Upload'
        verbose_name_plural = 'Document Uploads'
        ordering = ['-uploaded_at']