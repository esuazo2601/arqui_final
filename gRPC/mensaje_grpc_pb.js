// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var mensaje_pb = require('./mensaje_pb.js');

function serialize_gRPC_Mensaje(arg) {
  if (!(arg instanceof mensaje_pb.Mensaje)) {
    throw new Error('Expected argument of type gRPC.Mensaje');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_gRPC_Mensaje(buffer_arg) {
  return mensaje_pb.Mensaje.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_gRPC_MensajeResponse(arg) {
  if (!(arg instanceof mensaje_pb.MensajeResponse)) {
    throw new Error('Expected argument of type gRPC.MensajeResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_gRPC_MensajeResponse(buffer_arg) {
  return mensaje_pb.MensajeResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_gRPC_ObtenerMensajeRequest(arg) {
  if (!(arg instanceof mensaje_pb.ObtenerMensajeRequest)) {
    throw new Error('Expected argument of type gRPC.ObtenerMensajeRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_gRPC_ObtenerMensajeRequest(buffer_arg) {
  return mensaje_pb.ObtenerMensajeRequest.deserializeBinary(new Uint8Array(buffer_arg));
}


var MensajeServiceService = exports.MensajeServiceService = {
  crearMensaje: {
    path: '/gRPC.MensajeService/CrearMensaje',
    requestStream: false,
    responseStream: false,
    requestType: mensaje_pb.Mensaje,
    responseType: mensaje_pb.MensajeResponse,
    requestSerialize: serialize_gRPC_Mensaje,
    requestDeserialize: deserialize_gRPC_Mensaje,
    responseSerialize: serialize_gRPC_MensajeResponse,
    responseDeserialize: deserialize_gRPC_MensajeResponse,
  },
  obtenerMensaje: {
    path: '/gRPC.MensajeService/ObtenerMensaje',
    requestStream: false,
    responseStream: false,
    requestType: mensaje_pb.ObtenerMensajeRequest,
    responseType: mensaje_pb.Mensaje,
    requestSerialize: serialize_gRPC_ObtenerMensajeRequest,
    requestDeserialize: deserialize_gRPC_ObtenerMensajeRequest,
    responseSerialize: serialize_gRPC_Mensaje,
    responseDeserialize: deserialize_gRPC_Mensaje,
  },
};

exports.MensajeServiceClient = grpc.makeGenericClientConstructor(MensajeServiceService);
