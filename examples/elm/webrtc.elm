port module Main exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Html.Events.Extra exposing (onEnter)


-- import Html.Events.Extra exposing (..)


main =
    Html.program
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- MODEL


type alias Model =
    { id : String
    , input : String
    , messages : String
    }


leaderID =
    "testing"


init =
    let
        model =
            { id = ""
            , peerId = ""
            , input = ""
            , messages = ""
            }
    in
        ( model, Cmd.none )



-- UPDATE


type Msg
    = MessageInput String
    | IdInput String
    | PeerInput String
    | ConnectPeer
    | SendData
    | SendId
    | RecvData String
    | NewID String


update msg model =
    case msg of
        MessageInput str ->
            ( { model | input = str }, Cmd.none )

        IdInput str ->
            ( { model | id = str }, Cmd.none )

        PeerInput str ->
            ( { model | peerId = str }, Cmd.none )

        SendId ->
            ( model, createPeer <| Debug.log "sendid" model.id )

        ConnectPeer ->
            ( model, connectPeer <| Debug.log "sendid" model.peerId )

        SendData ->
            ( model, sendData <| Debug.log "senddata" model.input )

        RecvData data ->
            ( { model | messages = model.messages ++ " " ++ data }, Cmd.none )

        NewID id ->
            ( { model | id = id }, Cmd.none )



-- VIEW


view model =
    div []
        [ div []
            [ text ("ID: " ++ model.id) ]
        , idInput
        , peerInput
        , messageInput
        , div [] [ Html.text model.messages ]
        ]


idInput =
    div []
        [ input
            [ onInput IdInput
            ]
            []
        , button [ onClick SendId ] [ text "Create" ]
        ]


peerInput =
    div []
        [ input
            [ onInput PeerInput
            ]
            []
        , button [ onClick ConnectPeer ] [ text "Connect" ]
        ]


messageInput =
    div []
        [ input
            [ onInput MessageInput
            ]
            []
        , button [ onClick SendData ] [ text "Send" ]
        ]



-- SUBSCRIPTIONS


subscriptions model =
    Sub.batch
        [ recvData RecvData
        , peerID NewID
        ]



-- PORTS


port createPeer : String -> Cmd msg


port connectPeer : String -> Cmd msg


port peerID : (String -> msg) -> Sub msg


port sendData : String -> Cmd msg


port recvData : (String -> msg) -> Sub msg
