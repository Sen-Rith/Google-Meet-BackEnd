import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ProducerOptions } from 'mediasoup/lib/Producer';
import { RtpCapabilities } from 'mediasoup/lib/RtpParameters';
import { Transport } from 'mediasoup/lib/Transport';
import { DtlsParameters } from 'mediasoup/lib/WebRtcTransport';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/create-room')
  async createRoom() {
    return await this.appService.createRouter();
  }

  @Get('/:routerId/transports')
  getTransportsByRouterId(@Param('routerId') routerId: string) {
    return this.appService.getTransportsByRouterId(routerId)
  }

  @Get('/:transportId/producers')
  getProducersByTransportId(@Param('transportId') transportId: string) {
    return this.appService.getProducersByTransportId(transportId)
  }

  @Get('/:routerId')
  async getRtpCapabilities(@Param('routerId') routerId: string) {
    return this.appService.getRtpCapabilities(routerId)
  }

  @Post('/create-transport/:routerId')
  async createTransport(@Param('routerId') routerId: string) {
    return await this.appService.createTransport(routerId)
  }

  @Post('/:transportId/transport-connect')
  async connectTransport(@Param('transportId') transportId: string, @Body('dtlsParameters') dtlsParameters: DtlsParameters) {
    return await this.appService.connectTransport(transportId, dtlsParameters)
  }

  @Post('/:transportId/createProducer')
  async createProducer(@Param('transportId') transportId: string, @Body('producerOptions') producerOptions: ProducerOptions) {
    return await this.appService.createProducer(transportId, producerOptions)
  }

  @Post('/:transportId/createConsumer')
  async createconsumer(@Param('transportId') transportId: string, @Body('producerId') producerId: string, @Body('rtpCapabilities') rtpCapabilities: RtpCapabilities) {
    return await this.appService.createConsumer(transportId, producerId, rtpCapabilities)
  }

  @Put('/:transportId/closeTransport')
  closeTransport(@Param('transportId') transportId: string) {
    this.appService.closeTransport(transportId)
    return "Done"
  }
}
