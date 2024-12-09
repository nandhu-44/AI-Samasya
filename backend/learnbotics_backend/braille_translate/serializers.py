
# from rest_framework import serializers

# class TranslateSerializer(serializers.Serializer):
#     text = serializers.CharField(max_length=500)


from rest_framework import serializers

class YouTubeBrailleSerializer(serializers.Serializer):
    url = serializers.URLField(required=True)
