import uploadImageCloudinary from '../../utils/uploadImageCloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { jest } from "@jest/globals";

jest.mock('cloudinary');

describe('uploadImageCloudinary', () => {
    it('Debería cargar un buffer de imagen a Cloudinary exitosamente', async () => {
    
        const mockUploadResult = {
            public_id: 'test_id',
            secure_url: 'testurl.com',
            format: 'jpg',
            width: 100,
            height: 100
        };
        const mockStream = {
            end: jest.fn(function(buffer) {
                this._callback(null, mockUploadResult); 
            })
        };
        mockStream._callback = null;


        jest.spyOn(cloudinary.uploader, 'upload_stream').mockImplementation((options, callback) => {
            mockStream._callback = callback;
            return mockStream;
        });

        const mockImage = {
            buffer: Buffer.from('fake image buffer data')
        };

        const result = await uploadImageCloudinary(mockImage);

        expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
            { folder: "tiendaM" },
            expect.any(Function)
        );
        expect(mockStream.end).toHaveBeenCalledWith(mockImage.buffer);
        expect(result).toEqual(mockUploadResult);
    });

});
