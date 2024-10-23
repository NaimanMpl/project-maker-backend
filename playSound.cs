// Exemple de script pour jouer le son de saut

public class PlayerController : MonoBehaviour
{
    public AudioManager audioManager;

    void Update()
    {
        // Lorsque le joueur appuie sur la barre d'espace, il saute et on joue le son de saut
        if (Input.GetKeyDown(KeyCode.Space))  // Si la touche espace est appuyée
        {
            audioManager.PlayJumpSound();  // Joue le son de saut
        }
    }
}