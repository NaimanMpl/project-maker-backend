using UnityEngine;

public class AudioManager : MonoBehaviour
{
    // Références aux fichiers audio (.wav)
    public AudioClip cityAmbiantSound; // musique de fond de base
    public AudioClip jumpSound;
    public AudioClip trapSound;
    public AudioClip deathSound;
    public AudioClip dogSound;
    public AudioClip eatSound;
    public AudioClip explosionSound;
    public AudioClip hitSound;
    public AudioClip menuSound;
    public AudioClip timerStressSound;
    public AudioClip victorySound;
    public AudioClip walkSound;


    // Référence à l'AudioSource attaché à ce GameObject
    private AudioSource audioSource;

    void Start()
    {
        // Récupère l'AudioSource attaché au GameObject
        audioSource = GetComponent<AudioSource>();

        // Démarre la musique de fond quand le jeu commence
        PlayBackgroundMusic();
    }

    // Méthode pour jouer la musique de fond d'une ville ambiante en boucle (cityAmbiantSound)
    public void PlayCityAmbiant()
    {
        audioSource.clip = cityAmbiantSound;
        audioSource.loop = true;  // Musique en boucle
        audioSource.Play();
    }

    // Méthode pour jouer le son de saut (jump sound)
    public void PlayJumpSound()
    {
        audioSource.PlayOneShot(jumpSound);  // Joue le son de saut une fois
    }

    // Méthode pour jouer un son de piège (trap sound)
    public void PlayTrapSound()
    {
        audioSource.PlayOneShot(trapSound);  // Joue le son du piège une fois
    }

    // Méthode pour jouer un son de mort du player (deathSound) 
    public void PlayDeathSound()
    {
        audioSource.PlayOneShot(deathSound);  // Joue le son de la mort du player une fois
    }

    // Méthode pour jouer un son de chien (dogSound) 
    public void PlayDogSound()
    {
        audioSource.PlayOneShot(dogSound);  // Joue le son de la mort du player une fois
    }

    // Méthode pour jouer un son de miam miam du player (eatSound) 
    public void PlayEatSound()
    {
        audioSource.PlayOneShot(eatSound);  // Joue le son de miam miam du player une fois
    }

    // Méthode pour jouer un son d'explosion (explosionSound) 
    public void PlayExplosionSound()
    {
        audioSource.PlayOneShot(explosionSound);  // Joue le son de l'explosion une fois
    }

    // Méthode pour jouer un son de hit sur le player, il se cogne ou se prend un piège (hitSound) 
    public void PlayHitSound()
    {
        audioSource.PlayOneShot(hitSound);  // Joue le son de hit une fois
    }

    // Méthode pour jouer un son de menu en boucle (menuSound) 
    public void PlayMenuSound()
    {
        audioSource.clip = menuSound;
        audioSource.loop = true;  // Musique en boucle
        audioSource.Play();
    }

    // Méthode pour jouer un son de timer stressant en boucle (timerStressSound) 
    public void PlayTimerStressSound()
    {
        audioSource.clip = timerStressSound;
        audioSource.loop = true;  // Musique en boucle
        audioSource.Play();
    }

    // Méthode pour jouer un son de victoire (victorySound) 
    public void PlayVictorySound()
    {
        audioSource.PlayOneShot(victorySound);  // Joue le son de victoire une fois
    }

    // Méthode pour jouer un son de marche en boucle (walkSound) 
    public void PlayWalkSound()
    {
        audioSource.clip = walkSound;
        audioSource.loop = true;  // Musique en boucle
        audioSource.Play();  
    }

}
