port module Main exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)


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
    String


init =
    ( "testing", createPeer () )



-- UPDATE


type Msg
    = Change String
    | SendData String
    | RecvData String
    | Opened Bool
    | NewID String


update msg model =
    case msg of
        Change newWord ->
            ( newWord, Cmd.none )

        SendData msg ->
            ( model, sendData <| Debug.log "senddata" msg )

        RecvData data ->
            ( model ++ " " ++ data, Cmd.none )

        Opened bool ->
            ( model ++ " " ++ (Debug.log "opened" <| toString bool), Cmd.none )

        NewID id ->
            ( id, Cmd.none )



-- VIEW


view model =
    div []
        [ input
            [ onInput Change
              -- , onEnter SendData
            ]
            []
          -- , button [ onClick SendData ] [ text "Send" ]
        , div [] [ Html.text model ]
        ]



-- SUBSCRIPTIONS


subscriptions model =
    Sub.batch
        [ recvData RecvData
        , peerID NewID
        , opened Opened
        ]



-- PORTS


port createPeer : () -> Cmd msg


port createConnection : Int -> Cmd msg


port opened : (Bool -> msg) -> Sub msg


port peerID : (String -> msg) -> Sub msg


port sendData : String -> Cmd msg


port recvData : (String -> msg) -> Sub msg
